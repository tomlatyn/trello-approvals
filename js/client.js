TrelloPowerUp.initialize({
  // Card back section - shows approval table in the card details
  'card-back-section': function(t, opts) {
    return t.get('card', 'shared', 'approvals', null)
    .then(function(approvalData) {
      if (!approvalData || !approvalData.members) {
        return null;
      }
      
      return {
        title: 'Approvals',
        icon: 'https://cdn-icons-png.flaticon.com/512/3024/3024593.png',
        content: {
          type: 'iframe',
          url: t.signUrl('./approval-section.html')
          // No height specified = auto height
          // No resize: false = allows resizing
        }
      };
    })
    .catch(function(error) {
      console.error('Error in card-back-section:', error);
      return null;
    });
  },
  
  // Rest of your code remains the same...
  'card-buttons': function(t, opts) {
    return [{
      icon: 'https://cdn-icons-png.flaticon.com/512/3024/3024593.png',
      text: 'Approvals',
      callback: function(t) {
        return t.popup({
          title: 'Manage Approvals',
          url: './manage-approvals.html',
          height: 800,
          width: 450
        });
      }
    }];
  },
  
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
      
      var badgeColor, badgeText;
      
      if (rejectedCount > 0) {
        badgeColor = '#de350b';
        badgeText = 'REJECTED';
      } else if (approvedCount === totalCount) {
        badgeColor = '#00875a';
        badgeText = 'APPROVED';
      } else {
        badgeColor = '#ff9f1a';
        badgeText = 'PENDING';
      }
      
      return [{
        text: badgeText,
        color: badgeColor
      }];
    })
    .catch(function(error) {
      console.error('Error in card-badges:', error);
      return [];
    });
  },
});