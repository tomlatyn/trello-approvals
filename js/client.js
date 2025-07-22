
const STORAGE_KEY = 'approvals';

TrelloPowerUp.initialize({
  // Card back section - shows approval table in iframe
  'card-back-section': function(t) {
    return t.get('card', 'shared', STORAGE_KEY)
      .then(function(approvalData) {
        if (!approvalData || !approvalData.members) {
          return null; // Don't show section if no approvals
        }
        
        // Check if current user is the creator
        return t.member('id').then(function(currentUserId) {
          var isCreator = (approvalData.createdBy === currentUserId.id);
          
          // Use iframe with URL parameters to pass approval data
          var result = {
            title: 'Approvals SM',
            icon: './icon.png',
            content: {
              type: 'iframe',
              url: './approval-section.html?data=' + encodeURIComponent(JSON.stringify(approvalData))
            }
          };

          if (isCreator) {
            result.action = {
              text: 'Reset all',
              callback: function(t) {
                return resetAllApprovals(t);
              }
            };
          }
          
          return result;
        });
      })
      .catch(function(error) {
        console.error('Error in card-back-section:', error);
        return null; // Hide section on error
      });
  },
  
  // Card buttons capability - shows dynamic button text based on approval status
  'card-buttons': function(t) {
    return t.get('card', 'shared', STORAGE_KEY)
      .then(function(approvalData) {
        return [{
          icon: './icon.png',
          text: approvalData ? 'Manage Approvals' : 'Create Approvals',
          callback: function(t) {
            return t.popup({
              title: 'Manage Approvals',
              url: './manage-approvals.html',
              height: 700
            });
          }
        }];
      })
      .catch(function(error) {
        console.error('Error in card-buttons:', error);
        // Return default button even if data loading fails
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
      });
  },
  
  'card-badges': function(t, opts) {
    // Use the centralized badge logic
    return TrelloApprovalBadges.getCardBadges(t, opts);
  },
});

// Function to reset all approvals to pending status
function resetAllApprovals(t) {
  console.log('🔄 Reset all approvals function called!');
  
  if (!confirm('Are you sure you want to reset all approvals to pending status?\n\nThis action cannot be undone.')) {
    return;
  }
  
  return t.get('card', 'shared', STORAGE_KEY, null)
  .then(function(approvalData) {
    console.log('📄 Got approval data:', approvalData);
    if (!approvalData || !approvalData.members) {
      console.log('❌ No approval data or members found');
      return;
    }
    
    console.log('🔄 Resetting statuses for', Object.keys(approvalData.members).length, 'members');
    // Reset all members to pending status
    Object.keys(approvalData.members).forEach(function(memberId) {
      console.log('Resetting member:', memberId, 'from', approvalData.members[memberId].status, 'to pending');
      approvalData.members[memberId].status = 'pending';
      approvalData.members[memberId].actionDate = new Date().toISOString();
    });
    
    console.log('💾 Saving updated approval data...');
    // Save the updated data
    return t.set('card', 'shared', STORAGE_KEY, approvalData);
  })
  .then(function() {
    console.log('✅ Data saved successfully!');
    // Data change via t.set() will automatically refresh the card-back-section
  })
  .catch(function(error) {
    console.error('❌ Error resetting approvals:', error);
    alert('Failed to reset approvals. Please try again.');
  });
}