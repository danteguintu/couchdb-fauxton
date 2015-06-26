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
  'addons/dataimporter/actiontypes'
], function (app, FauxtonAPI, ActionTypes) {

  var DataImporterStore = FauxtonAPI.Store.extend({

    init: function (firstTimeHere) { //to reset, call this with true
      if (firstTimeHere) {
        this._isDataCurrentlyLoading = false;
        this._hasDataLoaded = false;
        this._hasErrored = false;
        this._theData = [];
        this._theMetadata = [];
        this._smallData = [];
      } // else keeps store as it was when you left
    },

    isDataCurrentlyLoading: function () {
      return this._isDataCurrentlyLoading;
    },

    dataIsLoading: function () {
      this._isDataCurrentlyLoading = true;
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
      return this._theFile.size > 25000000 ? true : false;
    },

    loadMeta: function (meta) {
      this._theMetadata = meta;
    },

    loadFile: function (file) {
      this._theFile = file;
    },

    calcSmallPreviewOfData: function () {
      var filesize = this._theFile.size,
          rows = this._theData.length,
          sizeOfEachRow,    //this is approximate!
          sizeCap = 250000,
          numberOfRowsToShow;

      sizeOfEachRow = filesize / rows;
      numberOfRowsToShow = Math.ceil(sizeCap / sizeOfEachRow);

      this._rowsShown = numberOfRowsToShow;
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

        case ActionTypes.DATA_IMPORTER_DATA_LOAD_COMPLETE:
          this.dataLoaded();
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_ERROR_IN_DATA_LOAD:
          this.errorInDataLoading();
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_CALC_SMALL_PREVIEW_OF_DATA:
          this.calcSmallPreviewOfData();
          console.log("here");
          this.triggerChange();
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
