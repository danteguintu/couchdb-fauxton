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
    hasData: false,
    render: function () {
      if (this.hasData) {
        return <DataImporterPreviewLoad />;
      } else {
        return <DataImporterDropZone />;
      }
    }
  });

  var DataImporterDropZone = React.createClass({
    getInitialState: function () {
      return { red: true };
    },

    dragOver: function (e) {
      e.preventDefault();
      console.log("dragOver");
      this.setState({ red: true });
    },

    endDragover: function (e) {
      this.setState({red: false});
    },

    drop: function (e) {
      e.preventDefault();
      this.setState({ red: false });
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
          console.log("All done! -- add loader stopper here");
          console.log('results:', file);
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
      var red = this.state.red ? "red-background" : "";

      return (
        <div className={red + " thing"} 
          onDragOver={this.dragOver} 
          onDragLeave={this.endDragover} 
          onDrop={this.drop}>
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
