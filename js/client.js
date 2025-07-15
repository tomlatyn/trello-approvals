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
        console.log('Current user ID:', currentUserId);
        console.log('Approval data createdBy:', approvalData.createdBy);
        var actualUserId = currentUserId.id || currentUserId;
        var isCreator = (approvalData.createdBy === actualUserId);
        console.log('isCreator:', isCreator);
        
        var result = {
          title: 'Approvals SM',
          icon: './icon.png',
          content: {
            type: 'iframe',
            url: t.signUrl('./approval-section.html')
          }
        };
        
        console.log('About to check isCreator for reset button...');
        // Add "Reset all" action only if user is the creator
        if (isCreator) {
          console.log('Adding reset all action!');
          result.action = {
            text: 'Reset all',
            callback: function(t) {
              return resetAllApprovals(t);
            }
          };
        } else {
          console.log('NOT adding reset all action - user is not creator');
        }
        
        console.log('Final result object:', result);
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
      text: 'Approvals SM',
      callback: function(t) {
        return t.popup({
          title: 'Manage Approvals',
          url: './manage-approvals.html',
          height: 700
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
    // Force refresh of the iframe content by reloading the card back section
    return t.card('all').then(function() {
      // Close any open popup and let Trello refresh the card back section
      return t.closePopup();
    });
  })
  .catch(function(error) {
    console.error('Error resetting approvals:', error);
    alert('Failed to reset approvals. Please try again.');
    return Promise.resolve();
  });
}