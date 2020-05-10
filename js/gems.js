var GemType = {
	HpRegen: 0,
	CritChance: 0,
	Damage: 0,
}

var GemMetaData = [
	{
		type: GemType.Damage,
		name: "Gem of Power",
		description: "Increases weapon attack damage to enemies by 1% per level.",
		img: "red-gem.png",
		baseLevelCost: 100000,
		getCost: function(level) {
			return this.baseLevelCost + (level * 100);
		}
	},
	{
		type: GemType.Gold,
		name: "Gem of Riches",
		description: "Increases gold gained per enemy by 1% per level.",
		img: "gold-gem.png",
		baseLevelCost: 100000,
		getCost: function(level) {
			return this.baseLevelCost + (level * 100);
		}
	},
	{
		type: GemType.BossDamage,
		name: "Gem of Judgement",
		description: "Increases weapon attack damage to bosses by 1% per level.",
		img: "purple-gem.png",
		baseLevelCost: 100000,
		getCost: function(level) {
			return this.baseLevelCost + (level * 100);
		}
	}
];