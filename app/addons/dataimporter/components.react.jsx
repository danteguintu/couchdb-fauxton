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
        hasDataLoaded: dataImporterStore.hasDataLoaded(),
        isBigFile: dataImporterStore.isThisABigFile(),
        rowShown: dataImporterStore.getRowsShown(),
        rowsTotal: dataImporterStore.getTotalRows(),
        data: dataImporterStore.getTheData(),
        meta: dataImporterStore.getTheMetadata(),
        getPreviewView: dataImporterStore.getPreviewView(),
        getSmallPreviewOfData: dataImporterStore.getSmallPreviewOfData(),
        getHeaderConfig: dataImporterStore.getConfigSetting('header')
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
        return (
          <DataImporterPreviewData 
            rowShown={this.state.rowShown} 
            rowsTotal={this.state.rowsTotal} 
            data={this.state.data} 
            isBigFile={this.state.isBigFile} 
            meta={this.state.meta}
            getPreviewView={this.state.getPreviewView}
            getSmallPreviewOfData={this.state.getSmallPreviewOfData}
            getHeaderConfig= {this.state.getHeaderConfig} />
        );
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
      Actions.loadFile(file);
    },

    filechosen: function (e) {
      this.captureEventAndSetLoading(e);
      var file = e.nativeEvent.target.files[0];
      Actions.loadFile(file);
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
      var rowShown = this.props.rowShown,
          totalRows = this.props.rowsTotal;

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
          bigFileInfoMessage = this.props.isBigFile ? this.bigFilePreviewWarning() : "";

      return (
        <div id="preview-page"> 
          <div className="top-row">
            {startOverButton}
            {bigFileInfoMessage}
          </div>
          <OptionsRow />
          <div className="preview-data-space">
            <TableView 
              data={this.props.data} 
              isBigFile={this.props.isBigFile} 
              meta={this.props.meta}
              getPreviewView={this.props.getPreviewView}
              getSmallPreviewOfData={this.props.getSmallPreviewOfData}
              getHeaderConfig={this.props.getHeaderConfig} />
            <JSONView 
              data={this.props.data} 
              isBigFile={this.props.isBigFile} 
              meta={this.props.meta}
              getPreviewView={this.props.getPreviewView}
              getSmallPreviewOfData={this.props.getSmallPreviewOfData}
              getHeaderConfig={this.props.getHeaderConfig} />
          </div>
          <Footer />
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
        leftClick: function () { Actions.setPreviewView('table'); },
        rightClick: function () { Actions.setPreviewView('json'); },
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
        leftClick: function () {  Actions.setParseConfig('header', true); },
        rightClick: function () { Actions.setParseConfig('header', false); },
        enclosingID: 'header-toggle-id'
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
          Actions.setParseConfig('dynamicTyping', true);
        },
        rightClick: function () {
          Actions.setParseConfig('dynamicTyping', false);
        },
        enclosingID: 'numbers-toggle-id'
      };
      return <Components.ToggleState toggleConfig={config} />;

    },

    delimiter: function () {
      var setup = {
        title: 'Delimiter',
        id: 'data-importer-delimiter',
        selected: 'Automatic',
        selectOptions: [
          { name: "a", onClick: function () {  console.log("a"); }  },
          { name: "b", onClick: function () {  console.log("b"); }  },
        ]
      };
      return <Components.SmallDropdown dropdownSetup={setup}/>;
    },

    render: function () {
      return (
        <div className="import-options-row">
          <div className="options-row">
            {this.previewToggle()}
            {this.header()}
            {this.numbers_format()}
            {this.delimiter()}
          </div>
        </div>
      );
    }
  });

  var TableView = React.createClass({
    eachRow: function () {
      var data = this.props.data;

      if (this.props.isBigFile) {
        data = this.props.getSmallPreviewOfData;
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
      var header = null;

      if (this.props.getHeaderConfig) {
        header = this.props.meta.fields;
        return (
          header.map(function (field, i) {
            return <th key={i} title={field}>{field}</th>;
          })
        );
      } else {
        header = this.props.data;
        return (
          header.map(function (field, i) {
           return <th key={i} title={i}>{i}</th>;
          })
        );
      }
    },

    render: function () {
      var data = this.eachRow(),
          header = this.header();

      if (this.props.getPreviewView === 'table') {
        return (
          <table className="data-import-table">
            <tr>{header}</tr>
            {data}
          </table>
        );
      } else {
        return null;
      }
    }
  });

  var JSONView = React.createClass({
    objectify: function (array) {
      var object = {};

      _.map(array, function (val, i) {
        object[i] = val;
      });

      return object;
    },

    rows: function () {
      var data = this.props.data;

      if (this.props.isBigFile) {
        data = this.props.getSmallPreviewOfData;
      }

      return (
        data.map(function (dataObj, i) {
          var obj = this.props.getHeaderConfig ? dataObj :
            this.objectify(dataObj);

          return (
            <Components.SimpleDoc 
              id={i} 
              content={JSON.stringify(obj, null, ' ')}
              key={i} />
          );
        }.bind(this))
      );
    },

    render: function () {
      if (this.props.getPreviewView === "json") {
        return (
          <div id="doc-list" className="json-view">
            {this.rows()}
          </div>
        );
      } else {
        return null;
      }
    }
  });

  var Footer = React.createClass({
    render: function () {
      return (
        <div className="footer">
          <span>Database Import</span>
          <span>Databse Choose</span>
          <span>Import Button</span>
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
