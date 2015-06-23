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
      this.setState({draggingOver: false});
    },

    drop: function (e) {
      e.preventDefault();
      this.setState({ draggingOver: false });
      this.setState({ loading: true });

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
          Actions.dataLoadedComplete();
        },
        error: function () {
          console.log("error");
          Actions.errorInDataLoading();
        },
        download: false,
        skipEmptyLines: false,
        chunk: undefined,
        fastMode: undefined,
        beforeFirstChunk: undefined,
      });

    },

    render: function () {
      var draggingOver = this.state.draggingOver ? 'dragging-file-in-background' : '',
          loading = this.state.loading ? 'loading-background' : '';

      return (
        <div className={loading + " " + draggingOver + " dropzone"} 
          onDragOver={this.dragOver} 
          onDragLeave={this.endDragover} 
          onDrop={this.drop}>
          Drop Zone 
        </div>
      );
    }

  });

  var DataImporterPreviewData= React.createClass({
    render: function () {
      return <div> Preview Page </div>;
    }
  });



  return {
    DataImporterController: DataImporterController,
    DataImporterDropZone: DataImporterDropZone,
    DataImporterPreviewData: DataImporterPreviewData
  };
});
