function cardBackSectionHandler(t, opts) {
  return t.get('card', 'shared', 'approvals', null)
  .then(function(approvalData) {
    if (!approvalData || !approvalData.members) {
      return null;
    }

    // Check if current user is the creator
    return t.member('id').then(function(currentUserId) {
      var isCreator = (approvalData.createdBy === currentUserId.id);

      // Encode approval data and current user ID as URL parameters
      var encodedData = encodeURIComponent(JSON.stringify(approvalData));
      var encodedUserId = encodeURIComponent(currentUserId.id);

      var result = {
        title: 'Approvals SM',
        icon: './images/icon.png',
        content: {
          type: 'iframe',
          url: t.signUrl('./approval-section.html?data=' + encodedData + '&userId=' + encodedUserId)
        }
      };

      if (isCreator) {
        result.action = {
          text: 'Reset all',
          callback: function(t) {
            // Show confirmation dialog directly
            if (confirm('Are you sure you want to reset all approvals to pending status?\n\nThis action cannot be undone.')) {
              resetAllApprovals(t);
            }
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
}

function resetAllApprovals(t) {
  console.log('🔄 Reset all approvals function called!');

  t.get('card', 'shared', 'approvals', null)
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
    // Data change via t.set() will automatically refresh the card-back-section
  })
  .catch(function(error) {
    console.error('❌ Error resetting approvals:', error);
    alert('Failed to reset approvals. Please try again.');
  });
}
