// Card detail badges feature handler
function cardDetailBadgesHandler(t) {
  return [{
    title: 'Approvals',
    text: 'Manage Approvals',
    color: 'purple',
    callback: function(t) {
      return t.popup({
        title: 'Manage Approvals',
        url: './views/manage-approvals.html',
        height: 700
      });
    }
  }];
}
