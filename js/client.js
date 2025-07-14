TrelloPowerUp.initialize({
  // Card back section - shows approval table in the card details
  'card-back-section': function(t, opts) {
    return t.get('card', 'shared', 'approvals', null)
    .then(function(approvalData) {
      if (!approvalData || !approvalData.members) {
        return null;
      }
      
      // Check if current user is the creator
      return t.member('id').then(function(currentUserId) {
        var isCreator = (approvalData.createdBy === currentUserId);
        
        var result = {
          title: 'Approvals',
          icon: './icon.png',
          content: {
            type: 'iframe',
            url: t.signUrl('./approval-section.html')
          },
          action: {
            text: 'Reset all',
            callback: function(t) {
              return resetAllApprovals(t);
            }
          }
        };
        
        // Add "Reset all" action only if user is the creator
        // if (isCreator) {
        //   result.action = {
        //     text: 'Reset all',
        //     callback: function(t) {
        //       return resetAllApprovals(t);
        //     }
        //   };
        // }
        
        return result;
      });
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
      text: 'Approvals',
      callback: function(t) {
        return t.popup({
          title: 'Manage Approvals',
          url: './manage-approvals.html'
        });
      }
    }];
  },
  
  'card-badges': function(t, opts) {
    // Use the centralized badge logic
    return TrelloApprovalBadges.getCardBadges(t, opts);
  },
});

// Function to reset all approvals to pending status
function resetAllApprovals(t) {
  return t.get('card', 'shared', 'approvals', null)
  .then(function(approvalData) {
    if (!approvalData || !approvalData.members) {
      return;
    }
    
    // Reset all members to pending status
    Object.keys(approvalData.members).forEach(function(memberId) {
      approvalData.members[memberId].status = 'pending';
      approvalData.members[memberId].actionDate = new Date().toISOString();
    });
    
    // Save the updated data
    return t.set('card', 'shared', 'approvals', approvalData);
  })
  .then(function() {
    // Refresh the iframe content
    return t.closePopup();
  })
  .catch(function(error) {
    console.error('Error resetting approvals:', error);
    return t.popup({
      title: 'Error',
      url: './error.html?message=Failed to reset approvals'
    });
  });
}