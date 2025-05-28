TrelloPowerUp.initialize({
  'card-detail-badges': function(t, opts) {
    // Get approval data and show status badge
    return t.get('card', 'shared', 'approvals', null)
    .then(function(approvalData) {
      var badges = [];
      
      if (approvalData && approvalData.members) {
        var members = Object.values(approvalData.members);
        var totalCount = members.length;
        var approvedCount = members.filter(m => m.status === 'approved').length;
        var rejectedCount = members.filter(m => m.status === 'rejected').length;
        var pendingCount = members.filter(m => m.status === 'pending').length;
        
        // Determine overall status
        var overallStatus, badgeColor, badgeText;
        
        if (rejectedCount > 0) {
          overallStatus = 'rejected';
          badgeColor = 'red';
          badgeText = 'Rejected';
        } else if (approvedCount === totalCount) {
          overallStatus = 'approved';
          badgeColor = 'green';
          badgeText = 'Approved';
        } else {
          overallStatus = 'pending';
          badgeColor = 'yellow';
          badgeText = 'Pending';
        }
        
        badges.push({
          title: 'Approval Status',
          text: badgeText + ' (' + approvedCount + '/' + totalCount + ')',
          color: badgeColor,
          callback: function(t) {
            return t.popup({
              title: 'Manage Approvals',
              url: './approval-detail.html',
              height: 500,
              width: 400
            });
          }
        });
      }
      
      return badges;
    });
  },
  
  'card-buttons': function(t, opts) {
    return [{
      icon: 'https://cdn-icons-png.flaticon.com/512/3024/3024593.png',
      text: 'Approvals',
      callback: function(t) {
        // Check if approvals already exist
        return t.get('card', 'shared', 'approvals', null)
        .then(function(approvalData) {
          if (approvalData && approvalData.members) {
            // Show approval detail if approvals exist
            return t.popup({
              title: 'Manage Approvals',
              url: './approval-detail.html',
              height: 500,
              width: 400
            });
          } else {
            // Show member selection if no approvals exist
            return t.popup({
              title: 'Create Approvals',
              url: './popup.html',
              height: 450,
              width: 350
            });
          }
        });
      }
    }];
  },
  
  'card-badges': function(t, opts) {
    // Show approval status on board view
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
  }
});