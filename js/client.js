TrelloPowerUp.initialize({
  // Card back section - shows approval table in the card details
  'card-back-section': function(t, opts) {
    return t.get('card', 'shared', 'approvals', null)
    .then(function(approvalData) {
      if (!approvalData || !approvalData.members) {
        return null;
      }
      
      return {
        title: 'Approvals Pro',
        icon: './icon.png',
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
      icon: './icon.png',
      text: 'Approvals Pro',
      callback: function(t) {
        return t.popup({
          title: 'Manage Approvals',
          url: './manage-approvals.html',
          height: 600,
          width: 400
        });
      }
    }];
  },
  
  'card-badges': function(t, opts) {
    // Use the centralized badge logic
    return TrelloApprovalBadges.getCardBadges(t, opts);
  },
});