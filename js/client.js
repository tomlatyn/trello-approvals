TrelloPowerUp.initialize({
  // Card detail badges - shows approval table in card detail view
  'card-detail-badges': function(t, opts) {
    return t.get('card', 'shared', 'approvals', null)
    .then(function(approvalData) {
      if (!approvalData || !approvalData.members) {
        return [];
      }
      
      return [{
        title: 'Approval Status',
        text: 'View Approvals',
        color: 'blue',
        callback: function(t) {
          return t.attach({
            url: './approval-section.html',
            height: 400
          });
        }
      }];
    });
  },
  
  // Card buttons - always shows "Approvals" button in sidebar
  'card-buttons': function(t, opts) {
    return [{
      icon: 'https://cdn-icons-png.flaticon.com/512/3024/3024593.png',
      text: 'Approvals',
      callback: function(t) {
        return t.popup({
          title: 'Manage Approvals',
          url: './manage-approvals.html',
          height: 500,
          width: 400
        });
      }
    }];
  },
  
  // Card badges - shows status on board view
  'card-badges': function(t, opts) {
    return t.get('card', 'shared', 'approvals', null)
    .then(function(approvalData) {
      if (!approvalData || !approvalData.members) {
        return [];
      }
      
      var members = Object.values(approvalData.members);
      var totalCount = members.length;
      var approvedCount = members.filter(m => m.status === 'approved').length;
      var rejectedCount = members.filter(m => m.status === 'rejected').length;
      
      // Determine overall status and color
      var badgeColor, badgeText;
      
      if (rejectedCount > 0) {
        badgeColor = '#de350b'; // Red
        badgeText = 'REJECTED';
      } else if (approvedCount === totalCount) {
        badgeColor = '#00875a'; // Green
        badgeText = 'APPROVED';
      } else {
        badgeColor = '#ff9f1a'; // Orange/Yellow
        badgeText = 'PENDING';
      }
      
      return [{
        text: badgeText,
        color: badgeColor
      }];
    });
  },
  
  // Attachment sections - shows approval table below description
  'attachment-sections': function(t, opts) {
    return t.get('card', 'shared', 'approvals', null)
    .then(function(approvalData) {
      if (!approvalData || !approvalData.members) {
        return [];
      }
      
      return [{
        id: 'approvals',
        claimed: [{ url: './approval-section.html' }],
        title: 'Approval Status',
        content: {
          type: 'iframe',
          url: './approval-section.html',
          height: 300
        }
      }];
    });
  }
});