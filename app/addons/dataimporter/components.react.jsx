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
  'addons/dataimporter/stores',
  'addons/dataimporter/actions',
  'addons/components/react-components.react'
], function (FauxtonAPI, React, Stores, Actions, Components) {

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
        loading: this.props.isLoading,
        showLimitInfo: false
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
      this.captureEventAndSetLoading(e);
      var file = e.nativeEvent.dataTransfer.files[0];
      Actions.parseData(file);
    },

    filechosen: function (e) {
      this.captureEventAndSetLoading(e);
      var file = e.nativeEvent.target.files[0];
      Actions.parseData(file);
    },

    captureEventAndSetLoading: function (e) {
      e.preventDefault();
      this.setState({ draggingOver: false });
      this.setState({ loading: true });
      Actions.dataIsCurrentlyLoading();
    },

    uploadButton: function () {
      return (
        <p>
          <span className="fonticon icon-file-text-alt">
            <span className="file-upload btn">
              <span className="icon icon-search"></span>
              Choose File
              <input type="file" className="upload" onChange={this.filechosen} />
            </span>
          </span>
        </p>
      );
    },

    onFileLimitInfoToggle: function (e) {
      e.preventDefault();
      var toggle = this.state.showLimitInfo ? false : true;
      this.setState({ showLimitInfo : toggle });
    },

    fileLimitLink: function (msg) {
      return (
        <div className="filetype-txt">
          <a href="#"
            className="import-data-limit-info-link"
            onClick={this.onFileLimitInfoToggle}
            data-bypass="true">
            {msg}
          </a>
        </div>
      );
    },

    defaultBox: function () {
      return (
        <div className={"dropzone"} 
          onDragOver={this.dragOver} 
          onDragLeave={this.endDragover} 
          onDrop={this.drop}>
          <div className="dropzone-msg default">
            {this.uploadButton()}
            <p>Or drag a file into box.</p>
          </div>
          {this.fileLimitLink("File Limitations")}
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

    boxShowLimitInfo: function () {
      return (
         <div className="dropzone limit-info"
          onDragOver={this.dragOver} 
          onDragLeave={this.endDragover} 
          onDrop={this.drop}>
          <div className="dropzone-msg">
            <p>150 MB filesize limit.</p>
            <p>Only .csv, .tsv, .json files will import correctly.</p>
          </div>
          {this.fileLimitLink("Close")}
        </div>
      );
    },

    render: function () {
      var box = this.defaultBox();

      if (this.state.draggingOver) {
        box = this.boxIsDraggingOver();
      } else if (this.state.loading) {
        box = this.boxIsLoading();
      } else if (this.state.showLimitInfo) {
        box = this.boxShowLimitInfo();
      }
      return box;
    }
  });

  var DataImporterPreviewData = React.createClass({
    getInitialState: function () {
      return {
        isBigFile: dataImporterStore.isThisABigFile(),
        rowShown: dataImporterStore.getRowsShown(),
        rowsTotal: dataImporterStore.getTotalRows()
      };
    },

    startOverButton: function () {
      return (
        <a className="start-import-over-link" 
          onClick={this.startover}>
        Start Over
        </a>
      );
    },

    startover: function () {
      Actions.dataImporterInit(true);
    },

    bigFilePreviewWarning: function () {
      var rowShown = this.state.rowShown,
          totalRows = this.state.rowsTotal;

      return (
        <div className="big-file-info-message">
          <p className="big-file-preview-limit-info-message">
            Because of the size of this file, this preview only shows the 
            first {rowShown} rows, out of {totalRows} rows total.
            However, if you choose to load the data into a database, the 
            entirety of the file (all {totalRows} rows) will be imported.
          </p>
        </div>
      );
    },

    render: function () {
      var startOverButton = this.startOverButton(),
          bigFileInfoMessage = this.state.isBigFile ? this.bigFilePreviewWarning() : "";

      return (
        <div id="preview-page"> 
          <div className="top-row">
            {startOverButton}
            {bigFileInfoMessage}
          </div>
          <div className="import-options-row">
            <OptionsRow />
          </div>
          <div className="preview-data-space">
            <TableView />
            <JSONView />
          </div>
          <div className="footer">
            <span>Database Import</span>
            <span>Databse Choose</span>
            <span>Import Button</span>
          </div>
        </div>
      );
    }
  });

  var TableView = React.createClass({
    getInitialState: function () {
      return {
        data: dataImporterStore.getTheData(),
        meta: dataImporterStore.getTheMetadata(),
        isBigFile: dataImporterStore.isThisABigFile(),
      };
    },

    eachRow: function () {
      var data = this.state.data;

      if (this.state.isBigFile) {
        data = dataImporterStore.getSmallPreviewOfData();
      }

      return (
        data.map(function (dataObj, i) {
          return <tr key={i}>{this.insideEachRow(dataObj)}</tr>;
        }.bind(this))
      );
    },

    insideEachRow: function (dataObj) {
      return _.map(dataObj, function (dataVal, dataKey) {
        return <td key={dataKey} title={dataVal}>{dataVal}</td>;
      });
    },

    header: function () {
      var header = this.state.meta.fields;
      return (
        header.map(function (field, i) {
          return <th key={i} title={field}>{field}</th>;
        })
      );
    },

    render: function () {
      var data = this.eachRow(),
          header = this.header();
      return (
        <table className="data-import-table">
          <tr>{header}</tr>
          {data}
        </table>
      );
    }
  });

  var JSONView = React.createClass({
    getInitialState: function () {
      return {
        data: dataImporterStore.getTheData(),
        meta: dataImporterStore.getTheMetadata(),
        isBigFile: dataImporterStore.isThisABigFile()
      };
    },

    rows: function () {
      var data = this.state.data;

      if (this.state.isBigFile) {
        data = dataImporterStore.getSmallPreviewOfData();
      }

      return (
        data.map(function (dataObj, i) {
          return (
            <Components.SimpleDoc 
              id={i} 
              content={JSON.stringify(dataObj, null, ' ')}
              key={i} />
          );
        }.bind(this))
      );
    },

    render: function () {
      return (
        <div id="doc-list" className="json-view">
          {this.rows()}
        </div>
      );
    }
  });

  var OptionsRow = React.createClass({
    previewToggle: function () {
      var config = {
        title: 'Preview View',
        leftLabel : 'Table',
        rightLabel : 'JSON',
        defaultLeft: true,
        leftClick: function () {
          console.log("left");
        },
        rightClick: function () {
          console.log("right");
        },
        enclosingID: 'preview-toggle-id'
      };

      return <Components.ToggleState toggleConfig={config} />;
    },

    header: function () {
      var config = {
        title: 'Header',
        leftLabel : 'First Line',
        rightLabel : 'No Header',
        defaultLeft: true,
        leftClick: function () {
          console.log("left");
        },
        rightClick: function () {
          console.log("right");
        },
        enclosingID: 'header-toggle-id'
      };

      return <Components.ToggleState toggleConfig={config} />;
    },

    one_doc_per_row: function () {
      var config = {
        title: 'One Document Per',
        leftLabel : 'Row',
        rightLabel : 'File',
        defaultLeft: true,
        leftClick: function () {
          console.log("left");
        },
        rightClick: function () {
          console.log("right");
        },
        enclosingID: 'document-type-toggle-id'
      };
      return <Components.ToggleState toggleConfig={config} />;

    },

    numbers_format: function () {
      var config = {
        title: 'Numbers are',
        leftLabel : 'Numbers',
        rightLabel : 'Strings',
        defaultLeft: true,
        leftClick: function () {
          console.log("left");
        },
        rightClick: function () {
          console.log("right");
        },
        enclosingID: 'numbers-toggle-id'
      };
      return <Components.ToggleState toggleConfig={config} />;

    },

    delimiter: function () {
      var config = {
        title: 'Delimiter',
        leftLabel : 'Drop',
        rightLabel : 'Down',
        defaultLeft: true,
        leftClick: function () {
          console.log("left");
        },
        rightClick: function () {
          console.log("right");
        },
        enclosingID: 'delimiter-toggle-id'
      };
      return <Components.ToggleState toggleConfig={config} />;

    },

    render: function () {
      return (
        <div className="options-row">
          {this.previewToggle()}
          {this.header()}
          {this.one_doc_per_row()}
          {this.numbers_format()}
          {this.delimiter()}
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
