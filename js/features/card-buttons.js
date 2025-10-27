function cardButtonsHandler(t, opts) {
  return [{
    icon: './images/icon.png',
    text: 'Approvals SM',
    callback: function(t) {
      return t.popup({
        title: 'Manage Approvals',
        url: './manage-approvals.html',
        height: 700,
        callback: function(t, opts) {
          // This callback runs when t.notifyParent('done') is called from the popup
          // Card-back-section iframe will automatically reload due to t.set() changing pluginData
          console.log('Manage approvals popup completed, card-back-section will auto-refresh');
        }
      });
    }
  }];
}
