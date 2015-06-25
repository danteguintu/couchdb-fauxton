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
  'addons/dataimporter/actions',
    'addons/components/react-components.react'
], function (FauxtonAPI, React, Papa, Stores, Actions, Components) {

  Papa.SCRIPT_PATH = '../../assets/js/libs/papaparse.min.js'; //this is super important so we can use worker threads

  var dataImporterStore = Stores.dataImporterStore;

  var DataImporterController = React.createClass({
    getStoreState: function () {
      return {
        isDataCurrentlyLoading: dataImporterStore.isDataCurrentlyLoading(),
        hasDataLoaded: dataImporterStore.hasDataLoaded()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      dataImporterStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      dataImporterStore.off('change', this.onChange, this);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    render: function () {
      console.log("render controller");
      if (this.state.hasDataLoaded) {
        return <DataImporterPreviewData />;
      } else {
        return <DataImporterDropZone isLoading={this.state.isDataCurrentlyLoading} />;
      }
    }
  });

  var DataImporterDropZone = React.createClass({
    getInitialState: function () {
      return {
        draggingOver: false,
        loading: this.props.isLoading
      };
    },

    dragOver: function (e) {
      e.preventDefault();
      this.setState({ draggingOver: true });
    },

    endDragover: function (e) {
      e.preventDefault();
      this.setState({draggingOver: false});
    },

    drop: function (e) {
      e.preventDefault();
      this.setState({ draggingOver: false });
      this.setState({ loading: true });
      Actions.dataIsCurrentlyLoading();

      var file = e.nativeEvent.dataTransfer.files[0];
      var results = Papa.parse(file, {
        delimiter : "",  // auto-detect
        newline: "",  // auto-detect
        header: true,
        dynamicTyping: false,
        preview: 0,
        encoding: "",
        worker: true, //so the page doesn't lock up
        comments: false,
        step: function (row) {  //streaming
          dataImporterStore.loadData(row.data[0]);
        },
        complete: function () {
          Actions.dataLoadedComplete();
        },
        error: function () {
          console.log("There was an error while parsing the file.");
          Actions.errorInDataLoading();
        },
        download: false,
        skipEmptyLines: false,
        chunk: undefined,
        fastMode: undefined,
        beforeFirstChunk: undefined,
      });

    },

    uploadButton: function () {
      return (
        <span className="fileUpload btn">
          <span className="icon icon-search"></span>
          Choose File
          <input type="file" className="upload" onChange={this.filechosen}/>
        </span>
      );
    },

    filechosen: function (e) {
      e.preventDefault();
      this.setState({ draggingOver: false });
      this.setState({ loading: true });
      Actions.dataIsCurrentlyLoading();

      var file = e.nativeEvent.target.files[0] ;
      console.log(file);
      var results = Papa.parse(file, {
        delimiter : "",  // auto-detect
        newline: "",  // auto-detect
        header: true,
        dynamicTyping: false,
        preview: 0,
        encoding: "",
        worker: true, //so the page doesn't lock up
        comments: false,
        step: function (row) {  //streaming
          dataImporterStore.loadData(row.data[0]);
        },
        complete: function () {
          Actions.dataLoadedComplete();
        },
        error: function () {
          console.log("There was an error while parsing the file.");
          Actions.errorInDataLoading();
        },
        download: false,
        skipEmptyLines: false,
        chunk: undefined,
        fastMode: undefined,
        beforeFirstChunk: undefined,
      });
    },


    defaultBox: function () {
      return (
        <div className={"dropzone"} 
          onDragOver={this.dragOver} 
          onDragLeave={this.endDragover} 
          onDrop={this.drop}>
          <div className="dropzone-msg default">
            <p>
              <span className="fonticon icon-file-text-alt">
              {this.uploadButton()}
              </span>
            </p>
            <p>Or drag a file into box.</p>
          </div>
          <div className="filetype-txt">(Only .csv, .tsv, or .json files)</div>
        </div>
      );
    },

    boxIsDraggingOver: function () {
      return (
        <div className={"dropzone dragging-file-in-background"} 
          onDragOver={this.dragOver} 
          onDragLeave={this.endDragover} 
          onDrop={this.drop}>
          <div className="dropzone-msg draggingover">
            <span className="fonticon icon-file-text-alt"></span>
            <span className="loading-msg">Drop your file.</span>
          </div>
        </div>
      );
    },

    boxIsLoading: function () {
      return (
        <div className={"dropzone loading-background"}>
          <div className="dropzone-msg loading">
            Loading...
            <Components.LoadLines />
          </div>
        </div>
      );
    },

    render: function () {
      console.log(this.state.draggingOver);
      var box = this.defaultBox();

      if (this.state.draggingOver) {
        box = this.boxIsDraggingOver();
      } else if (this.state.loading) {
        box = this.boxIsLoading();
      }

      return box;
    }
  });

  var DataImporterPreviewData= React.createClass({
    startover: function () {
      Actions.dataImporterInit(true);
    },

    render: function () {
      console.log("render preview");
      return (
        <div> Preview Page 
          <p><a onClick={this.startover}>Start Over</a></p>
        </div>
        );
    }
  });

  return {
    DataImporterController: DataImporterController,
    DataImporterDropZone: DataImporterDropZone,
    DataImporterPreviewData: DataImporterPreviewData
  };
});
