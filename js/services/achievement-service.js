var AchievementRift10 = {
    id: 0,
    title: "Welcome To Rifting",
    description: "Reach rift level 10.",
    onCompletedRift: function(riftNum) { return riftNum >= 10; }
}

var AchievementService = {

    /**
     * A list of all possible achievements.
     */
    _achievements: [],
    
    init: function() {
        this._achievements.push(AchievementRift10);
    },

    /**
     * Check if completing the specified rift number triggers an achievement.
     * Returns an achievement object if one was found.
     */
    onCompletedRift: function(riftNum) {
        var achievement = null;

        $.each(this._achievements, function(index, a) {
            if (a.onCompletedRift !== undefined) {
                if (a.onCompletedRift(riftNum)) {
                    achievement = a;
                    return false;
                }

                return true;
            }
        });

        return achievement;
    }
}