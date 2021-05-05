/**
 *  Create a WaveSurfer instance.
 */
 var wavesurfer; // eslint-disable-line no-var
var path = "http://www.archive.org/download/mshortworks_001_1202_librivox/msw001_03_rashomon_akutagawa_mt_64kb.mp3";
 /**
  * Init & load.
  */
 document.addEventListener('DOMContentLoaded', function() {
     // Init wavesurfer
     wavesurfer = WaveSurfer.create({
         container: '#waveform',
         height: 100,
         pixelRatio: 1,
         scrollParent: true,
         normalize: true,
         minimap: true,
         backend: 'MediaElement',
         plugins: [
             WaveSurfer.regions.create(),
             WaveSurfer.minimap.create({
                 height: 30,
                 waveColor: '#ddd',
                 progressColor: '#999',
                 cursorColor: '#999'
             }),
             WaveSurfer.timeline.create({
                 container: '#wave-timeline'
             })
         ]
     });


     wavesurfer.util
         .fetchFile({
             responseType: 'json',
             url: 'static/json/rashomon.json'
         })
         .on('success', function(data) {
             wavesurfer.load(
                 path,
                 data
             );
         });

     /* Regions */

     wavesurfer.on('ready', function() {
         wavesurfer.enableDragSelection({
             color: randomColor(0.1)
         });

         wavesurfer.enableDragSelection({
            color: randomColor(0.1)
        });

        if (localStorage.regions) {
            loadRegions(JSON.parse(localStorage.regions));
        } else {
            fetch('static/json/annotations.json')
             .then(r => r.json())
             .then(data => {
                displayRegions(data);
                loadRegions(data);
                saveRegions();
             });
        }

     });
     wavesurfer.on('region-click', function(region, e) {
         e.stopPropagation();
         // Play on click, loop on shift click
         e.shiftKey ? region.playLoop() : region.play();
     });
     wavesurfer.on('region-click', editAnnotation);
     wavesurfer.on('region-updated', saveRegions);
     wavesurfer.on('region-removed', saveRegions);
     wavesurfer.on('region-in', showNote);

     wavesurfer.on('region-play', function(region) {
         region.once('out', function() {
             wavesurfer.play(region.start);
             wavesurfer.pause();
         });
     });

     /* Toggle play/pause buttons. */
     let playButton = document.querySelector('#play');
     let pauseButton = document.querySelector('#pause');
     wavesurfer.on('play', function() {
         playButton.style.display = 'none';
         pauseButton.style.display = '';
     });
     wavesurfer.on('pause', function() {
         playButton.style.display = '';
         pauseButton.style.display = 'none';
     });


//     var data_action = document.querySelector('[data-action="delete-region"]');
//     if(data_action){
////         document.getElementById("display1").innerHTML = "data_action exist";
//        data_action.addEventListener('click', function() {
//            let form = document.forms.edit;
//            let regionId = form.dataset.region;
//            console.log("regionId: ", regionId);
//            if (regionId) {
//                wavesurfer.regions.list[regionId].remove();
//                form.reset();
//            }
//        });
//      }
//      else
//      {
//        document.getElementById("display1").innerHTML = "data_action not exist";
//      }


 });


/**
* Display regions from regions.
*/
function displayRegions(regions) {

 }

 /**
  * Load regions from regions.
  */
 function loadRegions(regions) {
     regions.forEach(function(region) {
         region.color = randomColor(0.1);
         wavesurfer.addRegion(region);
     });
 }

var count = 0;
 /**
  * Save annotations to regions.
  */
 function saveRegions() {
//     document.getElementById("displayA").innerHTML = JSON.stringify(regions, null, 4);
     count = count + 1;

     data1 = JSON.stringify(
         Object.keys(wavesurfer.regions.list).map(function(id) {
             let region = wavesurfer.regions.list[id];
             return {
                 start: region.start,
                 end: region.end,
                 attributes: region.attributes,
                 data: region.data
             };
         })
     );
    localStorage.regions = data1;

//    console.log("Before " + data1);
//    $.ajax({
//      url : "/examplemethod",
//      type : "POST",
//      data : data1,
//      contentType: 'application/json; charset=utf-8',
//      dataType: 'json',
//
//    })
//    .done(function(data){
////      console.log("After " + data1);
//    });

 }


 /**
  * Random RGBA color.
  */
 function randomColor(alpha) {
     return (
         'rgba(' +
         [
             ~~(Math.random() * 255),
             ~~(Math.random() * 255),
             ~~(Math.random() * 255),
             alpha || 1
         ] +
         ')'
     );
 }

 /**
  * Edit annotation for a region.
  */
 function editAnnotation(region) {
    console.log("editAnnotation: ", region);
     let form = document.forms.edit;
     form.style.opacity = 1;
     (form.elements.start.value = Math.round(region.start * 10) / 10),
     (form.elements.end.value = Math.round(region.end * 10) / 10);
     form.elements.note.value = region.data.note || '';
     form.onsubmit = function(e) {
         e.preventDefault();
         region.update({
             start: form.elements.start.value,
             end: form.elements.end.value,
             data: {
                 note: form.elements.note.value
             }
         });
         form.style.opacity = 0;
     };
     form.onreset = function() {
         form.style.opacity = 0;
         form.dataset.region = null;
     };
     form.dataset.region = region.id;
 }

 /* Progress bar */
document.addEventListener('DOMContentLoaded', function () {
    var progressDiv = document.querySelector('#progress-bar');
    var progressBar = progressDiv.querySelector('.progress-bar');

    var showProgress = function (percent) {
        progressDiv.style.display = 'block';
        progressBar.style.width = percent + '%';
    };

    var hideProgress = function () {
        progressDiv.style.display = 'none';
    };

    wavesurfer.on('loading', showProgress);
    wavesurfer.on('ready', hideProgress);
    wavesurfer.on('destroy', hideProgress);
    wavesurfer.on('error', hideProgress);
});

 /**
  * Display annotation.
  */
 function showNote(region) {
     if (!showNote.el) {
         showNote.el = document.querySelector('#subtitle');
     }
     showNote.el.textContent = region.data.note || '–';
 }

 /**
 * Bind controls.
 */
GLOBAL_ACTIONS['delete-region'] = function () {
    var form = document.forms.edit;
    var regionId = form.dataset.region;
    if (regionId) {
        wavesurfer.regions.list[regionId].remove();
        form.reset();
    }
};

GLOBAL_ACTIONS['export'] = function () {

    data1 = Object.keys(wavesurfer.regions.list).map(function(id) {
             let region = wavesurfer.regions.list[id];
             return {
                 start: region.start,
                 end: region.end,
                 attributes: region.attributes,
                 data: region.data
             };
         })

    // EXTRACT VALUE FOR HTML HEADER.
    // ('Book ID', 'Book Name', 'Category' and 'Price')
    var col = [];
    col.push("START");
    col.push("END");
    col.push("ANNOTATION");

    console.log("col: ", col);

    // CREATE DYNAMIC TABLE.
    var table = document.createElement("table");
    table.setAttribute('class', "table table-bordered");

    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

    var tr = table.insertRow(-1);                   // TABLE ROW.

    for (var i = 0; i < col.length; i++) {
        var th = document.createElement("th");      // TABLE HEADER.
        th.innerHTML = col[i];
        tr.appendChild(th);
    }

    header_list = ["start", "end", "data"];
    // ADD JSON DATA TO THE TABLE AS ROWS.
    for (var i = 0; i < data1.length; i++) {

        tr = table.insertRow(-1);

        for (var j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);
            content = data1[i][header_list[j]];
            if(j == 2)
            {
                content = content.note;
                if(content == "" || typeof content == 'undefined')
                {
                    content = "No Annotation";
                }
            }
            tabCell.innerHTML = content;

            console.log("content: ", content);
        }
    }


    console.log("table: ", table);
    // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
    var divContainer = document.getElementById("annotation-table");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);

    if (divContainer.style.display === "none") {
        divContainer.style.display = "block";
    } else {
        divContainer.style.display = "none";
    }

};

// Drag'n'drop
document.addEventListener('DOMContentLoaded', function () {
    console.log("document.addEventListener: ")
    var toggleActive = function (e, toggle) {
        e.stopPropagation();
        e.preventDefault();
        toggle ? e.target.classList.add('wavesurfer-dragover') :
            e.target.classList.remove('wavesurfer-dragover');
    };

    var handlers = {
        // Drop event
        drop: function (e) {
            toggleActive(e, false);

            // Load the file into wavesurfer
            if (e.dataTransfer.files.length) {
                wavesurfer.loadBlob(e.dataTransfer.files[0]);
            } else {
                wavesurfer.fireEvent('error', 'Not a file');
            }
        },

        // Drag-over event
        dragover: function (e) {
            toggleActive(e, true);
        },

        // Drag-leave event
        dragleave: function (e) {
            toggleActive(e, false);
        }
    };

    var dropTarget = document.querySelector('#drop');
    Object.keys(handlers).forEach(function (event) {
        dropTarget.addEventListener(event, handlers[event]);
    });
});
