TrelloPowerUp.initialize({
  // Card back section - shows approval table directly in card detail
  'card-back-section': function(t, opts) {
    console.log('card-back-section called');
    
    return t.get('card', 'shared', 'approvals', null)
    .then(function(approvalData) {
      console.log('card-back-section approval data:', approvalData);
      
      if (!approvalData || !approvalData.members) {
        console.log('No approval data found in card-back-section');
        return null;
      }
      
      // Get current member info - same logic as working version
      return t.member('all').then(function(currentMember) {
        console.log('card-back-section current member:', currentMember);
        
        // Same data passing logic that worked
        var members = Object.values(approvalData.members);
        var totalCount = members.length;
        var approvedCount = members.filter(m => m.status === 'approved').length;
        var rejectedCount = members.filter(m => m.status === 'rejected').length;
        var pendingCount = members.filter(m => m.status === 'pending').length;
        
        console.log('card-back-section stats:', {totalCount, approvedCount, rejectedCount, pendingCount});
        
        var params = new URLSearchParams({
          currentUserId: currentMember.id,
          totalCount: totalCount,
          approvedCount: approvedCount,
          rejectedCount: rejectedCount,
          pendingCount: pendingCount,
          membersData: JSON.stringify(approvalData.members)
        });
        
        console.log('card-back-section URL params created');
        
        return {
          title: 'Approvals',
          icon: 'https://cdn-icons-png.flaticon.com/512/3024/3024593.png',
          content: {
            type: 'iframe',
            url: './approval-section.html?' + params.toString(),
            height: 350
          }
        };
      })
      .catch(function(error) {
        console.error('Error in card-back-section member loading:', error);
        return null;
      });
    })
    .catch(function(error) {
      console.error('Error in card-back-section approval loading:', error);
      return null;
    });
  },
  
  // No card detail badges needed
  
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
  
  // Remove attachment sections for now
  /*
  'attachment-sections': function(t, opts) {
    return t.get('card', 'shared', 'approvals', null)
    .then(function(approvalData) {
      if (!approvalData || !approvalData.members) {
        return [];
      }
      
      return [{
        id: 'approvals',
        claimed: [],
        title: 'Approvals',
        content: {
          type: 'iframe',
          url: './approval-section.html',
          height: 350
        }
      }];
    });
  }
  */
});