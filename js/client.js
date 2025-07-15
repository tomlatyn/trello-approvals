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
        var isCreator = (approvalData.createdBy === currentUserId.id);
        
        var result = {
          title: 'Approvals SM',
          icon: './icon.png',
          content: {
            type: 'iframe',
            url: t.signUrl('./approval-section.html')
          }
        };

        if (isCreator) {
          result.action = {
            text: 'Reset all',
            callback: function(t) {
              console.log('🎯 Reset all button clicked!');
              return resetAllApprovals(t)
                .then(function() {
                  // After resetting, notify the iframe to refresh
                  notifyIframeToRefresh(t);
                })
                .catch(function(error) {
                  console.error('❌ Reset failed:', error);
                  return Promise.resolve();
                });
            }
          };
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

// Function to notify iframe to refresh its content
function notifyIframeToRefresh(t) {
  // Method 1: Try to find and post message to the iframe
  try {
    var iframes = document.querySelectorAll('iframe');
    iframes.forEach(function(iframe) {
      // Check if this is our approval section iframe
      if (iframe.src && iframe.src.includes('approval-section.html')) {
        console.log('📨 Sending refresh message to iframe');
        iframe.contentWindow.postMessage({ type: 'APPROVAL_DATA_CHANGED' }, '*');
      }
    });
  } catch (error) {
    console.log('Could not post message to iframe:', error);
  }
  
  // Method 2: Use Trello's broadcast mechanism
  // This will work even if we can't directly access the iframe
  t.broadcast('APPROVAL_DATA_CHANGED');
}

// Function to reset all approvals to pending status
function resetAllApprovals(t) {
  console.log('🔄 Reset all approvals function called!');
  
  if (!confirm('Are you sure you want to reset all approvals to pending status?')) {
    return Promise.resolve();
  }
  
  return t.get('card', 'shared', 'approvals', null)
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
    return t.set('card', 'shared', 'approvals', approvalData);
  })
  .then(function() {
    console.log('✅ Data saved successfully!');
    return Promise.resolve();
  })
  .catch(function(error) {
    console.error('❌ Error resetting approvals:', error);
    alert('Failed to reset approvals. Please try again.');
    throw error; // Re-throw to prevent the refresh notification
  });
}