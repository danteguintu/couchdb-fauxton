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
  'addons/dataimporter/actiontypes',
  'addons/dataimporter/resources'
],
function (FauxtonAPI, ActionTypes, Resources) {
  return {
    dataImporterInit: function (firstTimeHere) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_INIT,
        firstTimeHere: firstTimeHere
      });
    },

    dataIsCurrentlyLoading: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_DATA_IS_CURRENTLY_LOADING
      });
    },

    dataLoadedComplete: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_DATA_LOAD_COMPLETE
      });
    },

    errorInDataLoading: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_ERROR_IN_DATA_LOAD
      });
    },

    calcSmallPreviewOfData: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_CALC_SMALL_PREVIEW_OF_DATA
      });
    }
  };
});
