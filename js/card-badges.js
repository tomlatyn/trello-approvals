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
        approved: '✓',         // Checkmark for approved
        rejected: '×'          // Cross for rejected
    },

    // Alternative colorful emoji icons (use with monochrome: false)
    EMOJI_ICONS: {
        pending: '🟣',         // Purple circle for pending
        approved: '🟢',        // Green circle for approved
        rejected: '🔴'         // Red circle for rejected
    },

    // Local file icons (relative to your Power-Up's hosted location)
    LOCAL_ICONS: {
        pending: './icons/pending.svg',     // Relative path to your hosted files
        approved: './icons/approved.svg',   // Relative path to your hosted files
        rejected: './icons/rejected.svg'    // Relative path to your hosted files
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
     * Get the appropriate icon based on status and icon type
     * @param {string} status - The approval status
     * @param {string} iconType - Type of icons: 'simple', 'emoji', or 'local'
     * @returns {string} - The icon (symbol or URL)
     */
    getIcon: function(status, iconType) {
        iconType = iconType || 'simple';
        
        switch(iconType) {
            case 'emoji':
                return this.EMOJI_ICONS[status] || this.EMOJI_ICONS.pending;
            case 'local':
                return this.LOCAL_ICONS[status] || this.LOCAL_ICONS.pending;
            case 'simple':
            default:
                return this.ICONS[status] || this.ICONS.pending;
        }
    },

    /**
     * Create badge text with proper capitalization
     * @param {string} status - The approval status
     * @param {boolean} useIcons - Whether to include icons
     * @param {boolean} useTextOnly - Whether to use text-only approach
     * @param {Object} statusCounts - Object with counts of each status
     * @param {number} total - Total number of members
     * @param {string} iconType - Type of icons to use
     * @returns {string} - Formatted badge text
     */
    createBadgeText: function(status, useIcons, useTextOnly, statusCounts, total, iconType) {
        // For pending status, show approved/total format
        if (status === 'pending') {
            var approved = statusCounts.approved || 0;
            var countText = approved + '/' + total;
            
            if (useTextOnly) {
                return countText + ' approved';
            }
            
            if (useIcons) {
                var icon = this.getIcon(status, iconType);
                return icon + ' ' + countText;
            }
            
            return countText;
        }
        
        // For approved/rejected status, use proper capitalization
        if (useTextOnly) {
            return this.TEXT_ONLY[status] || this.TEXT_ONLY.pending;
        }

        if (useIcons) {
            var icon = this.getIcon(status, iconType);
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
        var useTextOnly = options.useTextOnly || false;
        var iconType = options.iconType || 'simple'; // 'simple', 'emoji', or 'local'
        var isDarkMode = options.theme === 'dark';

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
        
        var badgeText = this.createBadgeText(overallStatus, useIcons, useTextOnly, statusCounts, total, iconType);

        console.log('Generated badge:', {
            text: badgeText,
            color: badgeColor,
            status: overallStatus,
            memberCount: members.length,
            statusCounts: statusCounts,
            theme: isDarkMode ? 'dark' : 'light'
        });

        // Return array with single badge object matching Trello's expected format
        return [{
            text: badgeText,
            color: badgeColor,
            monochrome: iconType === 'local' ? true : (options.monochrome !== false)
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
                useTextOnly: false,    // Set to true for text-only badges
                iconType: 'simple',    // 'simple', 'emoji', or 'local'
                monochrome: true       // Set to false for colorful icons/emojis
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
                color: badgeColor,
                monochrome: true // Simple symbols work well as monochrome
            }];
        })
        .catch(function(error) {
            console.error('Error generating detailed card badges:', error);
            return [];
        });
    }
};