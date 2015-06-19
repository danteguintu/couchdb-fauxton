// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

define([
  'api',
  'react',
  'assets/js/libs/papaparse.min',
  'addons/dataimporter/stores',
  'addons/dataimporter/actions'
], function (FauxtonAPI, React, Papa, Stores, Actions) {
  var dataImporterStore = Stores.dataImporterStore;

  var DataImporterController = React.createClass({
    hasData: true,
    render: function () {
      if (this.hasData) {
        return <DataImporterDropZone />;
      } else {
        return <DataImporterPreviewLoad />;
      }
    }
  });

  var DataImporterDropZone = React.createClass({
    dragOver: function (e) {
      e.preventDefault();
    },

    drop: function (e) {
      e.preventDefault();
      console.log("dropped", Papa);

      var file = e.nativeEvent.dataTransfer.files[0];
      var results = Papa.parse(file, {
        delimiter : "",  // auto-detect
        newline: "",  // auto-detect
        header: false,
        dynamicTyping: false,
        preview: 0,
        encoding: "",
        worker: false,
        comments: false,
        step: function (row) {
          console.log("Row:", row.data);
        },
        complete: function (results, file) {
          console.log("All done!");
          console.log('results:', file);
          console.log(results);
        },
        error: undefined,
        download: false,
        skipEmptyLines: false,
        chunk: undefined,
        fastMode: undefined,
        beforeFirstChunk: undefined,
      });

    },

    render: function () {
      return (
        <div id="thing" onDragOver={this.dragOver} onDrop={this.drop}>
          Drop Zone 
        </div>
      );
    }

  });

  var DataImporterPreviewLoad = React.createClass({
    render: function () {
      return null;
    }
  });



  return {
    DataImporterController: DataImporterController,
    DataImporterDropZone: DataImporterDropZone,
    DataImporterPreview: DataImporterPreviewLoad
  };
});
