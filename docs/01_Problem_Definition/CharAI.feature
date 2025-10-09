Feature: CharAI

    These scenarios represent user interactions with the system. The purpose of this
    format is to convey the value of the system from the user's perspective. Note that
    the system is a "black box" from the user's perspective.

    Scenario: User creates an account
        When a user creates an account
        Then the system saves the user's information

    Scenario: User signs in and out
        When a user signs into the system
        Then the system indicates the user is signed in
        And the user can access previous biochar prescription maps

    Scenario: Manually enter coordinates
        When the user manually inputs land coordinates
        Then the system shall display the entered coordinates on an interactive map

    Scenario: User enters land area using an uploaded file
        When the user uploads a file containing land area information
        Then the system shall extract and display the land area on an interactive map

    Scenario: User requests prescription maps
        Given a user has entered their land coordinates
        When a user requests biochar prescription maps
        Then the system generates biochar prescription maps

    Scenario: Export prescription maps
        Given a user has generated a biochar prescription map
        When the user requests to download the biochar prescription maps
        Then the biochar prescription map is downloaded to the user's browser

    Scenario: System supports multiple users

    @security
    Scenario: System anonymizes user data


