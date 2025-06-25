// Card Badges Logic for Trello Approvals Power-Up
// Handles the display of approval status badges on Trello cards

window.TrelloApprovalBadges = {
    
    // Color constants matching approval section styles
    COLORS: {
        pending: '#7c3aed',    // Purple - matches .status-pending
        approved: '#10b981',   // Green - matches .status-approved  
        rejected: '#ef4444'    // Red - matches .status-rejected
    },

    // Icons for different statuses (using Unicode symbols)
    ICONS: {
        pending: '⏳',         // Hourglass
        approved: '✅',        // Check mark
        rejected: '❌'         // Cross mark
    },

    // Alternative icons (simple checkmarks)
    SIMPLE_ICONS: {
        pending: '○',          // Empty circle
        approved: '●',         // Filled circle
        rejected: '✕'          // Cross
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

        // Apply the logic (matching approval-section.html):
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
            // Fallback case (shouldn't happen with valid data)
            return 'pending';
        }
    },

    /**
     * Format status text with proper capitalization
     * @param {string} status - The status string
     * @returns {string} - Formatted status (first letter capitalized)
     */
    formatStatusText: function(status) {
        if (!status) return '';
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    },

    /**
     * Create badge text with icon and formatted status
     * @param {string} status - The approval status
     * @param {boolean} useSimpleIcons - Whether to use simple icons instead of emoji
     * @returns {string} - Formatted badge text
     */
    createBadgeText: function(status, useSimpleIcons) {
        var icons = useSimpleIcons ? this.SIMPLE_ICONS : this.ICONS;
        var icon = icons[status] || icons.pending;
        var text = this.formatStatusText(status);
        
        return icon + ' ' + text;
    },

    /**
     * Generate card badge data for Trello
     * @param {Object} approvalData - The approval data from Trello storage
     * @param {Object} options - Configuration options
     * @returns {Array} - Array of badge objects for Trello
     */
    generateCardBadges: function(approvalData, options) {
        options = options || {};
        var useSimpleIcons = options.useSimpleIcons || false;

        // Return empty array if no approval data
        if (!approvalData || !approvalData.members) {
            return [];
        }

        var members = Object.values(approvalData.members);
        var overallStatus = this.calculateOverallStatus(members);
        var badgeColor = this.COLORS[overallStatus];
        var badgeText = this.createBadgeText(overallStatus, useSimpleIcons);

        console.log('Generated badge:', {
            text: badgeText,
            color: badgeColor,
            status: overallStatus,
            memberCount: members.length
        });

        return [{
            text: badgeText,
            color: badgeColor,
            refresh: 60 // Refresh every 60 seconds
        }];
    },

    /**
     * Main function to be called by Trello Power-Up
     * @param {Object} t - Trello Power-Up context
     * @param {Object} opts - Options from Trello
     * @returns {Promise} - Promise resolving to badge array
     */
    getCardBadges: function(t, opts) {
        return t.get('card', 'shared', 'approvals', null)
        .then(function(approvalData) {
            return TrelloApprovalBadges.generateCardBadges(approvalData, {
                useSimpleIcons: false // Set to true if emoji don't display well
            });
        })
        .catch(function(error) {
            console.error('Error generating card badges:', error);
            return [];
        });
    }
};