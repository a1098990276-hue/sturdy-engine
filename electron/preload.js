const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
  loadData: async () => undefined,
  saveData: async () => undefined
});
