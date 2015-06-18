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
  'assets/js/libs/papaparse',
  'addons/dataimporter/stores',
  'addons/dataimporter/actions'
], function (FauxtonAPI, React, Papa, Stores, Actions) {
  var dataImporterStore = Stores.dataImporterStore;

  var DataImporterController = React.createClass({

    dragOver: function (e) {
      e.preventDefault();
    },

    drop: function (e) {
      e.preventDefault();

      console.log(e.nativeEvent.dataTransfer.files[0]);
      var results = Papa.parse(e.nativeEvent.dataTransfer.files[0], {config: {
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
        complete: function () {
          console.log("All done!");
        },
        error: undefined,
        download: false,
        skipEmptyLines: false,
        chunk: undefined,
        fastMode: undefined,
        beforeFirstChunk: undefined,
      }});
      console.log('results');
      console.log(results);
    },

    render: function () {
      return (
        <div id="thing" onDragOver={this.dragOver} onDrop={this.drop}>
          Drop
        </div>
      );
    }
  });



  return {
    DataImporterController: DataImporterController
  };
});
