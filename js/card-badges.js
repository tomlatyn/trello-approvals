// Card Badges Logic for Trello Approvals Power-Up
// Handles the display of approval status badges on Trello cards

window.TrelloApprovalBadges = {
    
    // Valid Trello badge colors (from documentation)
    COLORS: {
        pending: 'purple',     // Orange for pending status
        approved: 'green',     // Green for approved status  
        rejected: 'red'        // Red for rejected status
    },

    // Local file icons (relative to your Power-Up's hosted location)
    ICONS: {
        pending: 'icons/pending.svg',     // Local path to pending icon
        approved: 'icons/check.svg',   // Local path to approved icon
        rejected: 'icons/cross.svg'    // Local path to rejected icon
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
        // 1. If there are any rejected -> "rejected"
        // 2. If there are any pending and rest approved -> "pending"
        // 3. If all are approved -> "approved"
        
        if (statusCounts.rejected > 0) {
            return 'rejected';
        } else if (statusCounts.pending > 0) {
            return 'pending';
        } else if (statusCounts.approved > 0) {
            return 'approved';
        } else {
            // Fallback case
            return 'pending';
        }
    },

    /**
     * Get the appropriate icon based on status
     * @param {string} status - The approval status
     * @returns {string} - The local icon path
     */
    getIcon: function(status) {
        return this.ICONS[status] || this.ICONS.pending;
    },

    /**
     * Create badge text with proper capitalization
     * @param {string} status - The approval status
     * @param {boolean} useIcons - Whether to include icons
     * @param {Object} statusCounts - Object with counts of each status
     * @param {number} total - Total number of members
     * @returns {string} - Formatted badge text
     */
    createBadgeText: function(status, useIcons, statusCounts, total) {
        // For pending status, show approved/total format
        if (status === 'pending') {
            var approved = statusCounts.approved || 0;
            var countText = approved + '/' + total;
            
            if (useIcons) {
                var icon = this.getIcon(status);
                return icon + ' ' + countText;
            }
            
            return countText;
        }
        
        // For approved/rejected status, use proper capitalization
        if (useIcons) {
            var icon = this.getIcon(status);
            // Capitalize first letter properly
            var text = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
            return icon + ' ' + text;
        }

        // Just the status text with first letter capitalized
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
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

        // Return empty array if no approval data
        if (!approvalData || !approvalData.members) {
            return [];
        }

        var members = Object.values(approvalData.members);
        var total = members.length;
        
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
        
        var overallStatus = this.calculateOverallStatus(members);
        var badgeColor = this.COLORS[overallStatus];
        
        var badgeText = this.createBadgeText(overallStatus, useIcons, statusCounts, total);

        // Return array with single badge object matching Trello's expected format
        return [{
            text: badgeText,
            color: badgeColor,
            icon: this.getIcon(overallStatus),
            monochrome: true
        }];
    },

    /**
     * Main function to be called by Trello Power-Up
     * This is the callback function for the 'card-badges' capability
     * @param {Object} t - Trello Power-Up context
     * @returns {Promise} - Promise resolving to badge array
     */
    getCardBadges: function(t) {
        return t.get('card', 'shared', 'approvals', null)
        .then(function(approvalData) {
            return TrelloApprovalBadges.generateCardBadges(approvalData, {
                useIcons: true        // Set to false to disable icons
            });
        })
        .catch(function(error) {
            console.error('Error generating card badges:', error);
            return []; // Return empty array on error
        });
    },

};