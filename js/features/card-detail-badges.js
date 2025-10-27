// Card detail badges feature handler
function cardDetailBadgesHandler(t) {
  return t.get('card', 'shared', 'approvals', null).then(function(approvalData) {
    // Determine badge text based on whether approvals exist
    var badgeText = 'Set approvals';

    if (approvalData && approvalData.members && Object.keys(approvalData.members).length > 0) {
      badgeText = 'Change approvals';
    }

    return [{
      title: 'Approvals',
      text: badgeText,
      color: 'purple',
      callback: function(t) {
        return t.popup({
          title: 'Manage Approvals',
          url: './views/manage-approvals.html',
          height: 700
        });
      }
    }];
  });
}
