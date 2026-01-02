package com.example.QucikTurn.Entity.enums;

/**
 * Represents the status of a user account.
 */
public enum AccountStatus {
    /**
     * Account is active and fully functional
     */
    ACTIVE,

    /**
     * Account is suspended (can be reactivated by admin)
     */
    SUSPENDED,

    /**
     * Account has been permanently deleted/anonymized
     * User data is anonymized but certain records (chats, completed projects) are
     * preserved
     */
    DELETED
}
