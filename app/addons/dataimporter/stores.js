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
  'app',
  'api',
  'addons/dataimporter/actiontypes',
  'assets/js/libs/papaparse.min'
], function (app, FauxtonAPI, ActionTypes, Papa) {

  Papa.SCRIPT_PATH = '../../assets/js/libs/papaparse.min.js';

  var DataImporterStore = FauxtonAPI.Store.extend({

    init: function (firstTimeHere) { //to reset, call this with true
      if (firstTimeHere) {
        this._isDataCurrentlyLoading = false;
        this._hasDataLoaded = false;
        this._hasErrored = false;
        this._theData = [];
        this._theMetadata = [];
        this._smallData = [];
        this._time = 0;
        this._showView = 'table';
        this._theFile = { size: 0 };
        this._config = this.getDefaultConfig();

      } // else keeps store as it was when you left
    },

    isDataCurrentlyLoading: function () {
      return this._isDataCurrentlyLoading;
    },

    dataIsLoading: function () {
      this._isDataCurrentlyLoading = true;
    },

    getTime: function () {
      return this._time;
    },

    hasDataLoaded: function () {
      return this._hasDataLoaded;
    },

    dataLoaded: function () {
      this._hasDataLoaded = true;
    },

    errorInDataLoading: function () {
      this._errored = true;
    },

    loadData: function (data) {
      this._theData = data;
    },

    isThisABigFile: function () {
      console.log("UNCOMMENT OUT HERE");
      return this._theFile.size > 7 ? true : false;
      //return this._theFile.size > 75000 ? true : false;
    },

    loadMeta: function (meta) {
      this._theMetadata = meta;
    },

    loadFile: function (file) {
      console.log(file);
      this._theFile = file;
    },

    getTotalRows: function () {
      return this._totalRows;
    },

    getPreviewView: function () {
      return this._showView;
    },

    setPreviewView: function (type) {
      this._showView = type;
    },

    calcSmallPreviewOfData: function () {
      var filesize = this._theFile.size,
          rows = this._theData.length,
          sizeOfEachRow,    //this is approximate!
          sizeCap = 75000,  //in bytes
          numberOfRowsToShow;

      sizeOfEachRow = filesize / rows;
      numberOfRowsToShow = Math.ceil(sizeCap / sizeOfEachRow);

      this._rowsShown = numberOfRowsToShow;
      this._totalRows = rows;
      this._smallData = this._theData.slice(0, this._rowsShown);
    },

    getSmallPreviewOfData: function () {
      return this._smallData;
    },

    getRowsShown: function () {
      return this._rowsShown;
    },

    getTheMetadata: function () {
      return this._theMetadata;
    },

    getTheData: function () {
      return this._theData;
    },

    papaparse: function () {
      Papa.parse(this._theFile, this._config);
    },

    loadingComplete: function (results) {
      this.loadMeta(results.meta);
      this.loadData(results.data);

      if (this.isThisABigFile()) {
        this.calcSmallPreviewOfData();
      }

      this.dataLoaded();
      this.triggerChange();
    },

    clearData: function () {
      this._theData = [];
    },

    setParseConfig: function (key, value) {
      this._config[key] = value;
    },

    getConfigSetting: function (key) {
      return this._config[key];
    },

    getDefaultConfig: function () {
      return {
        delimiter : '',  // auto-detect
        newline: '',  // auto-detect
        header: true,
        dynamicTyping: false,
        preview: 0,
        encoding: '',
        worker: true, //so the page doesn't lock up
        comments: false,
        complete: function (results) {
          this.loadingComplete(results);
        }.bind(this),
        error: function () {
          console.log("There was an error while parsing the file.");
          this.errorInDataLoading();
        }.bind(this),
        download: false,
        skipEmptyLines: false,
        chunk: undefined,
        fastMode: false,
        beforeFirstChunk: undefined,
      };
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.DATA_IMPORTER_INIT:
          this.init(action.firstTimeHere);
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_DATA_IS_CURRENTLY_LOADING:
          this.dataIsLoading();
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_LOAD_FILE:
          this.loadFile(action.file);
          this.papaparse(action.file);
        break;

        case ActionTypes.DATA_IMPORTER_SET_PREVIEW_VIEW:
          this.setPreviewView(action.view);
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_SET_PARSE_CONFIG:
          this.setParseConfig(action.key, action.value);
          this.clearData();
          this.papaparse(this._theFile);
        break;

        default:
        return;
      }
    }
  });

  var dataImporterStore = new DataImporterStore();
  dataImporterStore.dispatchToken = FauxtonAPI.dispatcher.register(dataImporterStore.dispatch.bind(dataImporterStore));

  return {
    dataImporterStore: dataImporterStore
  };
});
