var ItemAttributeType = {
    MaxLife: 0,
    CritChance: 1,
    HpRegen: 2,
    Damage: 3,
    
    MaxAttribs: 4
};

var ItemAttributeService = {
    generateAttributes: function(area, count) {
        var attribs = [];
        
        for (var index = 0; index < count; index++) {
            var selectedType = -1;
            
            // Keep generating a random attrib index until one we dont have.
            while (selectedType === -1) {
                selectedType = Math.round(Math.random() * (ItemAttributeType.MaxAttribs-1));

                // Already have this attribute?
                attribs.forEach(function (x) {
                    if (x.type === selectedType) {
                        selectedType = -1;
                    }
                });
            }

            // Now create the attrib.
            var newAttrib = null;

            switch (selectedType) {
                case ItemAttributeType.MaxLife:
                    newAttrib = ItemAttributeService._createMaxLifeAttribute(area);
                    break;
                case ItemAttributeType.CritChance:
                    newAttrib = ItemAttributeService._createCritChanceAttribute(area);
                    break;
                case ItemAttributeType.HpRegen:
                    newAttrib = ItemAttributeService._createHpRegenAttribute(area);
                    break;
                case ItemAttributeType.Damage:
                    newAttrib = ItemAttributeService._createDamageAttribute(area);
                    break;
                default:
                    break;
            }

            if (newAttrib !== null) {
                attribs.push(newAttrib);
            }
        }

        return attribs;
    },

    _createMaxLifeAttribute: function(area) {
        return {
            type: ItemAttributeType.MaxLife,
            value: 2 * area,
        };
    },

    _createCritChanceAttribute: function(area) {
        return {
            type: ItemAttributeType.CritChance,
            value: 0.01 * area,
        };
    },

    _createHpRegenAttribute: function(area) {
        return {
            type: ItemAttributeType.HpRegen,
            value: Math.pow(area * 0.1, 1.5),
        };
    },

    _createDamageAttribute: function(area) {
        return {
            type: ItemAttributeType.Damage,
            value: 1 * area,
        };
    }
}

