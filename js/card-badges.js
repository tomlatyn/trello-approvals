// Card Badges Logic for Trello Approvals Power-Up
// Handles the display of approval status badges on Trello cards

window.TrelloApprovalBadges = {
    
    // Valid Trello badge colors (from documentation)
    COLORS: {
        pending: 'purple',     // Orange for pending status
        approved: 'green',     // Green for approved status  
        rejected: 'red'        // Red for rejected status
    },

    // Icons for different statuses (using simple, compatible symbols)
    ICONS: {
        pending: '○',          // Empty circle for pending
        approved: '●',         // Filled circle for approved
        rejected: '×'          // Cross for rejected
    },

    // Alternative text-only approach (no icons)
    TEXT_ONLY: {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected'
    },

    /**
     * Calculate overall approval status based on individual member statuses
     * @param {Array} members - Array of member objects with status property
     * @returns {string} - 'pending', 'approved', or 'rejected'
     */
    calculateOverallStatus: function(members) {
        if (!members || members.length === 0) {
            return 'pending';
        }

        // Count each status type
        var statusCounts = {
            pending: 0,
            approved: 0,
            rejected: 0
        };

        members.forEach(function(member) {
            if (statusCounts.hasOwnProperty(member.status)) {
                statusCounts[member.status]++;
            }
        });

        // Apply the logic:
        // 1. If there are any pending approvals -> "pending"
        // 2. If no pending and at least one rejected -> "rejected"  
        // 3. If all are approved -> "approved"
        
        if (statusCounts.pending > 0) {
            return 'pending';
        } else if (statusCounts.rejected > 0) {
            return 'rejected';
        } else if (statusCounts.approved > 0) {
            return 'approved';
        } else {
            // Fallback case
            return 'pending';
        }
    },

    /**
     * Create badge text - avoiding automatic uppercasing by Trello
     * @param {string} status - The approval status
     * @param {boolean} useIcons - Whether to include icons
     * @param {boolean} useTextOnly - Whether to use text-only approach
     * @returns {string} - Formatted badge text
     */
    createBadgeText: function(status, useIcons, useTextOnly) {
        if (useTextOnly) {
            return this.TEXT_ONLY[status] || this.TEXT_ONLY.pending;
        }

        if (useIcons) {
            var icon = this.ICONS[status] || this.ICONS.pending;
            // Use lowercase to prevent Trello from auto-uppercasing
            var text = status.toLowerCase();
            return icon + ' ' + text;
        }

        // Just the status text in lowercase
        return status.toLowerCase();
    },

    /**
     * Generate card badge data for Trello
     * @param {Object} approvalData - The approval data from Trello storage
     * @param {Object} options - Configuration options
     * @returns {Array} - Array of badge objects for Trello
     */
    generateCardBadges: function(approvalData, options) {
        options = options || {};
        var useIcons = options.useIcons !== false; // Default to true
        var useTextOnly = options.useTextOnly || false;

        // Return empty array if no approval data
        if (!approvalData || !approvalData.members) {
            return [];
        }

        var members = Object.values(approvalData.members);
        var overallStatus = this.calculateOverallStatus(members);
        var badgeColor = this.COLORS[overallStatus];
        var badgeText = this.createBadgeText(overallStatus, useIcons, useTextOnly);

        console.log('Generated badge:', {
            text: badgeText,
            color: badgeColor,
            status: overallStatus,
            memberCount: members.length
        });

        // Return array with single badge object matching Trello's expected format
        return [{
            text: badgeText,
            color: badgeColor
            // Note: refresh property is not needed as badges auto-refresh when card data changes
        }];
    },

    /**
     * Main function to be called by Trello Power-Up
     * This is the callback function for the 'card-badges' capability
     * @param {Object} t - Trello Power-Up context
     * @param {Object} opts - Options from Trello (unused in this implementation)
     * @returns {Promise} - Promise resolving to badge array
     */
    getCardBadges: function(t, opts) {
        return t.get('card', 'shared', 'approvals', null)
        .then(function(approvalData) {
            return TrelloApprovalBadges.generateCardBadges(approvalData, {
                useIcons: true,        // Set to false to disable icons
                useTextOnly: false     // Set to true for text-only badges
            });
        })
        .catch(function(error) {
            console.error('Error generating card badges:', error);
            return []; // Return empty array on error
        });
    },

    /**
     * Alternative implementation for dynamic badges with counts
     * Shows approval progress (e.g., "2/5 approved")
     * @param {Object} t - Trello Power-Up context
     * @returns {Promise} - Promise resolving to badge array
     */
    getDetailedCardBadges: function(t) {
        return t.get('card', 'shared', 'approvals', null)
        .then(function(approvalData) {
            if (!approvalData || !approvalData.members) {
                return [];
            }

            var members = Object.values(approvalData.members);
            var total = members.length;
            var approved = members.filter(function(m) { return m.status === 'approved'; }).length;
            var rejected = members.filter(function(m) { return m.status === 'rejected'; }).length;
            
            var overallStatus = TrelloApprovalBadges.calculateOverallStatus(members);
            var badgeColor = TrelloApprovalBadges.COLORS[overallStatus];
            
            // Create detailed text showing progress
            var badgeText = approved + '/' + total + ' approved';
            if (rejected > 0) {
                badgeText += ' (' + rejected + ' rejected)';
            }

            return [{
                text: badgeText,
                color: badgeColor
            }];
        })
        .catch(function(error) {
            console.error('Error generating detailed card badges:', error);
            return [];
        });
    }
};

// Usage in Power-Up initialization:
// TrelloPowerUp.initialize({
//   'card-badges': TrelloApprovalBadges.getCardBadges,
//   // ... other capabilities
// });