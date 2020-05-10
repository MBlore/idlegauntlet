var app = null;

$(function() {

	// Initial app state.
	appState.startDate = new Date().getTime();
		
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	// Returns a +/- random of 'percent' on the specified 'val'.
	function numWithPercentRandomness(val, percent) {
		var max = val * (1 + (percent / 100));
		var min = val * (1 - (percent / 100));

		return Math.round(getRandomInt(min, max));
	}
	
	function playCssAnim(selector, className) {
		var el = $(selector);
		el.removeClass(className);
		
		var clone = el.clone(true);
		clone.addClass(className);
		
		el.replaceWith(clone);
		
		return clone;
	}
	
	function chance(percent) {
		var max = 9999999999999;
		var rnd = getRandomInt(0, max);
		
		var limit = (percent / 100) * max;
				
		return rnd <= limit;
	}
	
	function addLog(text) {
		if (appState.log.length >= maxLogLines) {
			appState.log.splice(maxLogLines - appState.log.length - 1);
		}
				
		appState.log.unshift(text);
	}

	function saveGame() {
		store.set('gamestate', appState);
		store.set('saved', new Date().getTime());
	}

	function loadGame() {
		var data = store.get('gamestate');

		if (data !== undefined) {
			$.extend(appState, data);
			return true;
		}
	}

	function getManaDpsPercent() {
		return (appState.mana * 0.0001 * 100);
	}

	function getMaxEnemyHp() {		
		var hp = CurveFunction.getMaxEnemyHp(appState.area);

		var finalHp = numWithPercentRandomness(hp, 5);

		return finalHp;
	}

	function checkAutoContinue() {
		// If we have auto-continue enabled, lets move forward.
		if (appState.autoContinue && appState.areawon >= appState.area) {
			appState.area = appState.area + 1;
			onAreaChange();
			return true;
		}
	}

	function getMonsterName() {
		var names = [
			"Shadow of Regret",
            "Hate Manifest",
            "Irrbit",
            "Loathum",
            "Leverian",
            "Sinner",
            "Despair",
            "Oath Hoarder",
            "Wean Evilist",
            "Norc Rift",
            "Mourner",
            "Yasker",
            "Sheer Nightmare",
            "Pain Order",
            "Nihilistic Light",
            "Emergent Yarrow",
		];

		var rand = Math.round(getRandomInt(0, names.length-1));
		return names[rand];
	}

	function onSpawnEnemy() {
		$("#enemy-hp").removeClass("shake");

		if (appState.area % bossAreaMultiple == 0 &&
				appState.areawon < appState.area) {

			appState.enemyhp = getMaxEnemyHp() * Config.bossHpMultiplier;
			appState.enemy = "Boss";
			appState.enemyType = EnemyType.Boss;
		} else {
			appState.enemyhp = getMaxEnemyHp();
			appState.enemy = getMonsterName();
			appState.enemyType = EnemyType.Monster;
		}	
		
		appState.enemyMaxHp = appState.enemyhp;
		appState.enemydead = false;
		appState.status = "ATTACKING";

		onEnemyHpChanged();

		appState.heroHp = app.getHeroMaxHp;
		onHeroHpChanged();
	}

	function generateWeapon(level) {
		var weaponLevel = level;	// common

		var rarity = "common";

		if (chance(1)) {			// epic
			weaponLevel = weaponLevel + 30;
			rarity = "epic";
		} else if (chance(5)) {		// rare
			weaponLevel = weaponLevel + 10;
			rarity = "rare";
		} else if (chance(20)) {		// magical
			weaponLevel = weaponLevel + 5;
			rarity = "magical";
		}

		// Generate weapon damage min/max.
		var mid = CurveFunction.getWeaponDamage(weaponLevel);

		var min = mid - (mid * 0.1);
		var max = mid + (mid * 0.1);

		var weaponMin = Math.round(getRandomInt(min, mid));
		var weaponMax = Math.round(getRandomInt(weaponMin, max));

		return {
			mindamage: weaponMin,
			maxdamage: weaponMax,
			level: weaponLevel,
			rarity: rarity,
			inspected: false
		};
	}

	function getWeaponAverageAttack(weapon) {
		return weapon.maxdamage - ((weapon.maxdamage - weapon.mindamage) / 2);
	}

	function getTotalAverageDps() {
		// Equipment provides flat damage bonus.
		var equipmentAttackBonus = getTotalAttributeValueFromAllItems(ItemAttributeType.Damage);

		// Get an average weapon hit from min/max values.
		var averageAttack = (equipmentAttackBonus + getWeaponAverageAttack(appState.weapon));

		// Apply total % boosts from mana and gem.
		var totalPercentBonus = getTotalDamagePercentBonus();
		var totalPercentFactor = totalPercentBonus / 100;

		var singleAttack = averageAttack * (1 + totalPercentFactor);

		// Now assume we make 100 attacks.
		var hundredHits = singleAttack * 100;

		// Get the damage of a single crit hit.
		var critDamage = applyCritHitDamage(singleAttack) - singleAttack;

		// Assume how many of those would be crits.
		var critChance = getTotalCritChance();

		var damageFromCritHits = critDamage * critChance;

		var hundredHitsWithCritDamage = hundredHits + damageFromCritHits;

		var averageSingleDamage = hundredHitsWithCritDamage / 100;

		return Math.round(averageSingleDamage * tps);
	}
	
	function generateArmor(level) {
		var armorLevel = level;

		var rarity = "common";

		if (chance(1)) {			// epic
			armorLevel = armorLevel + 30;
			rarity = "epic";
		} else if (chance(5)) {		// rare
			armorLevel = armorLevel + 10;
			rarity = "rare";
		} else if (chance(20)) {		// magical
			armorLevel = armorLevel + 5;
			rarity = "magical";
		}
		
		return {
			level: armorLevel,
			hp: CurveFunction.getHpForArmorLevel(armorLevel),
			rarity: rarity,
			inspected: false
		};
	}

	function isBetterItem(newItem, currentItem) {
		if (!currentItem) {
			return true;
		}

		return newItem.level > currentItem.level;
	}

	function generateArmorForSlot(slotName, propName) {
		var newItem = generateArmor(appState.area);
		newItem.name = slotName;

		if (isBetterItem(newItem, appState.equipment[propName])) {
			if (!$("#button-items").hasClass('active-button')) {
				$("#button-items").addClass("glowing");
			}

			SoundService.playItemDrop();

			addLog("You found level " + newItem.level + " " + propName + ".");

			appState.equipment[propName] = newItem;
		}
	}

	function onGenerateLoot() {
		var el = playCssAnim(".new-gold", "anim-raise");

		var goldReward = CurveFunction.getGoldReward(appState.area);

		// Apply gold% gem.
		if (getGem(3) != null) {
			goldReward = goldReward * (1 + (getTotalGemValue(3) / 100));
		}

		el.text("+" + Math.round(goldReward).toLocaleString());

		appState.gold = appState.gold + goldReward;

		if (appState.enemyType == EnemyType.Boss) {
			var manaReward = CurveFunction.getManaCrystalRewardForBoss(appState.area);

			appState.manaCrystals = appState.manaCrystals + manaReward;

			var el = playCssAnim(".new-mana", "anim-raise");
			el.text("+" + manaReward);
		}
		
		if (chance(Config.lootDropPercent)) {

			// First chance of loot will always be a weapon
			// to be suitable for the rift we're on.
			var randomSlot = Math.round(getRandomInt(0, 7));

			if (appState.weapon.level < appState.area) {
				randomSlot = 7;
			}
			
			switch(randomSlot) {
				case 0: // head
					generateArmorForSlot("Head", 'head');
					break;
				case 1: // shoulders
					generateArmorForSlot("Shoulders", 'shoulders');
					break;
				case 2: // chest
					generateArmorForSlot("Chest", 'chest');
					break;
				case 3: // legs
					generateArmorForSlot("Legs", 'legs');
					break;
				case 4: // boots
					generateArmorForSlot("Boots", 'boots');
					break;
				case 5: // hands
					generateArmorForSlot("Hands", 'hands');
					break;
				case 6: // bracers
					generateArmorForSlot("Bracers", 'bracers');
					break;
				case 7: // weapon
					var newWeapon = generateWeapon(appState.area);
					newWeapon.name = "Weapon";

					/*
					// If average damage is higher than our current weapon - equip it.
					var newAverage = getWeaponAverageAttack(newWeapon);
					var curAverage = getWeaponAverageAttack(appState.weapon);
					*/

					if (newWeapon.level > appState.weapon.level) {

						SoundService.playItemDrop();
						
						addLog("You found a better weapon! (" +
							newWeapon.mindamage + "-" +
							newWeapon.maxdamage + " DMG)");

						appState.weapon = newWeapon;

					}
					break;
				default:
					addLog("No slot: " + randomSlot);
					break;
			}
		}
	}

	function unlockGem(gemId) {
		var gem = getGem(gemId);
		
		if (gem == null) {
			addLog("You found a gem!");

			// Create the gem.
			appState.gems.push({
				id: gemId,
				level: 1
			});

			// Make the gem button glow.
			if (!$("#button-gems").hasClass('active-button')) {
				$("#button-gems").addClass("glowing");
			}

			SoundService.playItemDrop();
		}
	}

	function checkForUnlockGem() {
		if (appState.area == 10) {
			unlockGem(0);
		} else if (appState.area == 50) {
			unlockGem(1);
		} else if (appState.area == 100) {
			unlockGem(2);
		} else if (appState.area == 200) {
			unlockGem(3);
		} else if (appState.area == 500) {
			unlockGem(4);
		}
	}

	function onEnemyDied() {
		appState.enemiesKilledInArea = appState.enemiesKilledInArea + 1;

		// Area unlock rules.
		if (appState.areawon < appState.area) {
			var unlocked = false;

			if (appState.enemyType == EnemyType.Monster) {
				if (appState.enemiesKilledInArea >= Config.enemiesPerArea) {
					unlocked = true;
				}
			} else if (appState.enemyType == EnemyType.Boss) {
				unlocked = true;
			}

			if (unlocked) {
				appState.areawon = appState.area;
				setAreaButtonState();
				addLog("You unlocked rift " + (appState.area + 1) + ".");
				checkForUnlockGem();
				
				var achieve = AchievementService.onCompletedRift(appState.area);

				if (achieve !== null) {
					addLog("Achievement unlocked: " + achieve.title);
					displayAchievement(achieve);
				}
			}
		}
		
		appState.status = "LOOTING"
		appState.enemydead = true;
		
		$("#enemy-hp").addClass("shake");
	}

	function displayAchievement(achieve) {
		
	}

	function getTotalHpRecovery() {
		var total = Config.baseHpRecovery + getTotalAttributeValueFromAllItems(ItemAttributeType.HpRegen);

		return total;
	}

	function onHeroRecover() {
		if (appState.heroHp === 0) {
			// Can't recover if we're dead.
			return;
		}

		var hpRecovery = getTotalHpRecovery();

		appState.heroHp = Math.min(appState.heroHp + hpRecovery, app.getHeroMaxHp);

		onHeroHpChanged();
	}

	function onEnemyHitHero() {
		if (appState.enemyhp == 0) {
			return;
		}

		if (!chance(Config.enemyAttackChance)) {
			return;
		}

		var enemyAttack = CurveFunction.getEnemyAttack(appState.area);

		// Debuff the attack of the boss to be the same as a mob
		// given its amount of buffed HP.
		if (appState.enemyType == EnemyType.Boss) {
			enemyAttack = enemyAttack / Config.bossHpMultiplier;
		}

		appState.heroHp = Math.max(appState.heroHp - enemyAttack, 0);
		onHeroHpChanged();

		if (appState.heroHp == 0) {
			onHeroDied();
		}
	}

	function onHeroDied() {
		appState.status = "YOU DIED";
		appState.deathCount = appState.deathCount + 1;

		pauseGame(5000, function() {
			
			setArea(appState.area - 1);

			if (appState.autoContinue && appState.options.cancelAutoContinue) {
				appState.autoContinue = false;
				CheckBox.updateCheckState("#chk-auto-continue", false);
			}

			resumeGame();
		});
	}

	function onHeroHpChanged() {
		var pb = $("#hero-hp-bar");
		var maxWidth = pb.parent().width();
		var factor = 1 - (appState.heroHp / app.getHeroMaxHp);
		pb.css("width", (maxWidth * factor) + "px");
	}

	function getTotalDamagePercentBonus() {
		var totalPercentBoost = getManaDpsPercent();
		return totalPercentBoost;
	}

	function applyCritHitDamage(value) {
		var baseFactor = 5;

		var gem = getGem(2);
		if (gem != null) {
			baseFactor = baseFactor + (getTotalGemValue(2) / 100);
		}

		return value * baseFactor;
	}
	
	function onEnemyAttack() {
		var equipmentAttackBonus = getTotalAttributeValueFromAllItems(ItemAttributeType.Damage);
		
		// Generate weapon damage.
		var attack = equipmentAttackBonus +
			Math.round(getRandomInt(appState.weapon.mindamage, appState.weapon.maxdamage));

		// Crit check.
		if (chance(getTotalCritChance())) {
			attack = applyCritHitDamage(attack);
			playCssAnim(".crit-notify", "anim-crit");
		}

		// Apply mana boost + gem% boost.
		var totalPercentBoost = getTotalDamagePercentBonus();

		attack = Math.round(attack * (1 + (totalPercentBoost / 100)));

		var newHp = appState.enemyhp - attack;
			
		if (newHp <= 0) {
			onEnemyDied();			
			newHp = 0;
		}
		
		appState.enemyhp = newHp;

		onEnemyHpChanged();
	}

	function onEnemyHpChanged() {
		var pb = $("#enemy-hp-bar");
		var maxWidth = pb.parent().width();
		var factor = 1 - (appState.enemyhp / appState.enemyMaxHp);
		pb.css("width", (maxWidth * factor) + "px");
	}

	function setArea(area) {
		appState.area = area;
		onAreaChange();
	}

	function onAreaChange() {
		if (appState.highestArea < appState.area) {
			appState.highestArea = appState.area;
		}
		
		appState.enemiesKilledInArea = 0;

		onSpawnEnemy();

		saveGame();

		setAreaButtonState();

		updatePageTitle();
	}

	function updatePageTitle() {
		document.title = "(" + appState.area + ") " + Config.pageTitle;
	}

	function setAreaButtonState() {
		if (appState.area == 1) {
			$("#btn-area-prev").hide();
		} else {
			$("#btn-area-prev").show();
		}

		if (appState.areawon >= appState.area) {
			$("#btn-area-next").show();	
		} else {
			$("#btn-area-next").hide();
		}
	}

	function returnHome() {
		appState.area = 1;
		appState.season = appState.season + 1;
		appState.areawon = 0;
		appState.gold = 0;
		appState.mana = appState.mana + appState.manaCrystals;
		appState.manaCrystals = 0;
		appState.weapon = { mindamage: 3, maxdamage: 3, level: 1, rarity: "common", name: "Weapon", inspected: true };

		appState.equipment.head = null;
		appState.equipment.shoulders = null;
		appState.equipment.chest = null;
		appState.equipment.legs = null;
		appState.equipment.boots = null;
		appState.equipment.hands = null;
		appState.equipment.bracers = null;

		onAreaChange();
		addLog("You have returned home.");
	}

	function selectTab(tabId) {
		$(".active-tab").removeClass("active-tab");
		$("#" + tabId).addClass("active-tab");
	}

	function selectMenuButton(buttonClassName) {
		$(".active-button").removeClass("active-button");
		$(buttonClassName).addClass("active-button");
	}

	function getValueForAttributeTypeFromItem(attribType, item) {
		if (item == null || item.attributes == null) {
			return 0;
		}

		var val = 0;

		item.attributes.forEach(function(e) {
			if (e.type === attribType) {
				val = e.value;
			}
		});

		return val;
	}

	function getTotalAttributeValueFromAllItems(attribType) {	
		var totalValue = 0;

		totalValue = totalValue + getValueForAttributeTypeFromItem(attribType, appState.equipment.head);
		totalValue = totalValue + getValueForAttributeTypeFromItem(attribType, appState.equipment.shoulders);
		totalValue = totalValue + getValueForAttributeTypeFromItem(attribType, appState.equipment.chest);
		totalValue = totalValue + getValueForAttributeTypeFromItem(attribType, appState.equipment.legs);
		totalValue = totalValue + getValueForAttributeTypeFromItem(attribType, appState.equipment.boots);
		totalValue = totalValue + getValueForAttributeTypeFromItem(attribType, appState.equipment.hands);
		totalValue = totalValue + getValueForAttributeTypeFromItem(attribType, appState.equipment.bracers);
		totalValue = totalValue + getValueForAttributeTypeFromItem(attribType, appState.weapon);

		return totalValue;
	}

	function getTotalCritChance() {
		var gem = getGem(1);

		var totalCritChance = appState.critchance + getTotalAttributeValueFromAllItems(ItemAttributeType.CritChance);

		if (gem != null) {
			totalCritChance = totalCritChance + getTotalGemValue(1);
		}

		return totalCritChance;
	}

	function getGem(gemId) {
		var foundGem = null;

		appState.gems.forEach(function(gem) {
			if (gem.id == gemId) {
				foundGem = gem;
			}
		});

		return foundGem;
	}

	function getTotalGemValue(gemId) {
		var gem = getGem(gemId);
		
		switch(gemId) {
			case 0:
				// Apophyllite
				return gem.level * 0.01;
			case 1:
				// Tiger's Eye Stone
				return gem.level * 0.01;
			case 2:
				// Dumortierite
				return gem.level * 1;
			case 3:
				// Carnelian
				return gem.level * 5;
			case 4:
				// Sodalite
				return gem.level * 1;
		}

		return 0;
	}

	// Load game data.

	var loaded = loadGame();

	Vue.config.devtools = true;

	app = new Vue({
		el: '.app',
		data: appState,
		methods: {
			onItemViewClick: function(item) {
				if (item == null) {
					return;
				}

				ItemDetailStore.selectedItem = item;
				appState.showItemDetail = true;
			},

			hasFoundGem: function(gemId) {
				var found = false;

				appState.gems.forEach(function(gem) {
					if (gem.id == gemId) {
						found = true;
					}
				});

				return found;
			},

			getGemLevel: function(gemId) {
				return getGem(gemId).level;
			},

			getGemCost: function(gemId) {
				return CurveFunction.getGemCost(
					getGem(gemId).level,
					gemId);
			},

			getGemValue: function(gemId) {
				return getTotalGemValue(gemId);
			},

			upgradeGem: function(gemId) {
				var gem = getGem(gemId);
				var cost = CurveFunction.getGemCost(gem.level, gemId);
				
				if (appState.mana < cost) {
					return;
				}

				gem.level = gem.level + 1;
				appState.mana = appState.mana - cost;
			},

			canAffordGem: function(gemId) {
				var gem = getGem(gemId);
				var cost = CurveFunction.getGemCost(gem.level, gemId);
				
				return appState.mana < cost ? "button-disabled" : "";
			},

			onResetGameClick: function() {
				Modal.yesNo('Are you sure you want to reset your game? All progress will be lost.', function(x) {
					if (x == 'yes') {
						appState = null;
						window.location.reload();
					}
				});
			}
		},
	  	computed: {
			averagedps: function() {
				return getTotalAverageDps();
			},

			manaValueLabel: function() {
				var manaDpsPercent = getManaDpsPercent();
				return appState.mana.toLocaleString() + " (+" + manaDpsPercent.toLocaleString() + "% DMG)";
			},

			hasEnemiesRemaining: function() {
				if (appState.enemyType == EnemyType.Boss) {
					return false;
				}

				if (appState.area <= appState.areawon) {
					return false;
				}

				if (appState.enemiesKilledInArea < Config.enemiesPerArea) {
					return true;
				}
			},

			enemiesRemaining: function() {
				return Config.enemiesPerArea - appState.enemiesKilledInArea;
			},

			totalArmor: function() {
				var armor = 0;
				if (appState.equipment.head) { armor = armor + appState.equipment.head.armor; }
				if (appState.equipment.shoulders) { armor = armor + appState.equipment.shoulders.armor; }
				if (appState.equipment.chest) { armor = armor + appState.equipment.chest.armor; }
				if (appState.equipment.legs) { armor = armor + appState.equipment.legs.armor; }
				if (appState.equipment.boots) { armor = armor + appState.equipment.boots.armor; }
				if (appState.equipment.hands) { armor = armor + appState.equipment.hands.armor; }
				if (appState.equipment.bracers) { armor = armor + appState.equipment.bracers.armor; }

				return armor;
			},

			totalCritChance: function() {
				return getTotalCritChance().toFixed(2);
			},

			totalDamageFromItems: function() {
				return getTotalAttributeValueFromAllItems(ItemAttributeType.Damage);
			},

			totalPassiveHpRegenPerSec: function() {
				var totalRegen = getTotalHpRecovery() * tps;

				return totalRegen.toFixed(2).toLocaleString();
			},

			totalHpFromItems: function() {
				var hpFromItems = getTotalAttributeValueFromAllItems(ItemAttributeType.MaxLife);

				return Math.round(hpFromItems).toLocaleString();
			},
			
			getHeroMaxHp: function() {
				var maxHp = Config.baseHeroMaxHp;

				var itemHp = 0;
				if (appState.equipment.head) { itemHp = itemHp + appState.equipment.head.hp; }
				if (appState.equipment.shoulders) { itemHp = itemHp + appState.equipment.shoulders.hp; }
				if (appState.equipment.chest) { itemHp = itemHp + appState.equipment.chest.hp; }
				if (appState.equipment.legs) { itemHp = itemHp + appState.equipment.legs.hp; }
				if (appState.equipment.boots) { itemHp = itemHp + appState.equipment.boots.hp; }
				if (appState.equipment.hands) { itemHp = itemHp + appState.equipment.hands.hp; }
				if (appState.equipment.bracers) { itemHp = itemHp + appState.equipment.bracers.hp; }

				maxHp = maxHp + itemHp;

				// Apply gem %.
				var gem = getGem(0);
				if (gem != null) {
					maxHp = maxHp * (1 + (getTotalGemValue(0) / 100));
				}

				if (appState.heroHp > maxHp) {
					// Correct the current HP if the max HP changed due to item changes.
					// TODO: Move this logic to a point where the item is equipped.
					appState.heroHp = maxHp;
					onHeroHpChanged();
				}

				return Math.round(maxHp);
			}
		}
	});

	onSpawnEnemy();

	SoundService.init();

	// State init.
	if (!loaded) {
		addLog("Your adventure begins.");
		addLog("You are on the search for your first weapon...");
	}

	appState.showItemDetail = false;

	setAreaButtonState();

	AchievementService.init();

	// Event registers.
	CheckBox.init();

	// Area back/next buttons.
	$("#btn-area-prev").click(function(e) {
		if (appState.area > 1) {
			appState.area = appState.area - 1;
			onAreaChange();
		}
	});

	$("#btn-area-next").click(function(e) {
		appState.area = appState.area + 1;
		onAreaChange();
	});

	// Return home button.
	$("#btn-home").click(function(e) {
		Modal.yesNo("Are you sure you want to return home?<br/>This will reset progress and convert your mana crystals in to mana.", function(result) {
			if (result != 'yes') {
				return;
			}

			$(ButtonType.Main).trigger('click');
			returnHome();
		});
	});

	// Menu button click.
	$(".top-menu .button").click(function(e) {
		$this = $(this);

		if ($this.attr("id") === "btn-home") {
			// No tab for the return home button.
			return;
		}

		if ($this.hasClass('active-button')) {
			return;
		}

		// Set menu button state.
		$(".active-button").removeClass("active-button");
		$this.addClass("active-button");

		// Change the tab view.
		var tab = $this.attr("data-fortab");
		selectTab(tab);

		// Turn off glowing.
		$this.removeClass("glowing");

		// If we return to main tab, set all items to have
		// been inspected.
		if ($this.attr('id') === "button-main") {
			if (appState.equipment.head !== null) { appState.equipment.head.inspected = true; }
			if (appState.equipment.shoulders !== null) { appState.equipment.shoulders.inspected = true; }
			if (appState.equipment.chest !== null) { appState.equipment.chest.inspected = true; }
			if (appState.equipment.legs !== null) { appState.equipment.legs.inspected = true; }
			if (appState.equipment.hands !== null) { appState.equipment.hands.inspected = true; }
			if (appState.equipment.bracers !== null) { appState.equipment.bracers.inspected = true; }
			if (appState.equipment.boots !== null) { appState.equipment.boots.inspected = true; }
			if (appState.weapon !== null) { appState.weapon.inspected = true; }
		}
	});

	// Auto continue.
	$("#chk-auto-continue").on('check-change', function(e) {
		var $this = $(this);
		if ($this.attr('data-checked') == 'true') {
			appState.autoContinue = true;
		} else {
			appState.autoContinue = false;
		}
	});

	// Option controls.
	if (appState.options.cancelAutoContinue) {
		CheckBox.updateCheckState("#chk-option-auto-continue", true);
	}

	if (appState.options.soundEnabled || appState.options.soundEnabled == undefined) {
		appState.options.soundEnabled = true;
		CheckBox.updateCheckState("#chk-option-sound-enabled", true);
	}

	// Auto continue on death.
	$("#chk-option-auto-continue").on('check-change', function(e) {
		var $this = $(this);
		if ($this.attr('data-checked') == 'true') {
			appState.options.cancelAutoContinue = true;
		} else {
			appState.options.cancelAutoContinue = false;
		}
		saveGame();
	});

	$("#chk-option-sound-enabled").on('check-change', function(e) {
		var $this = $(this);
		if ($this.attr('data-checked') == 'true') {
			appState.options.soundEnabled = true;
		} else {
			appState.options.soundEnabled = false;
		}
		saveGame();
	});

	// Load the home tab.
	$(ButtonType.Main).trigger('click');

	updatePageTitle();

	// Set auto continue initial state.
	if (appState.autoContinue) {
		CheckBox.updateCheckState("#chk-auto-continue", true);
	}
	
	// Save game state timer.
	window.addEventListener("beforeunload", function(e){ saveGame(); });
	setInterval(saveGame, 30000);

	var loopInterval = null;

	function lootEnemy() {
		onGenerateLoot();

		if (!checkAutoContinue()) {
			onSpawnEnemy();
		}

		resumeGame();
	}

	function pauseGame(delay, callback) {
		clearInterval(loopInterval);
		setTimeout(callback, delay);
	}

	function resumeGame() {
		loopInterval = setInterval(gameLoop, 1000 / tps);
	}

	function gameLoop() {
		try {
			// Game loop.
			if (appState.enemyhp === 0) {
				pauseGame(Config.lootEnemyDelay, lootEnemy);
			} else {
				onEnemyAttack();
				onEnemyHitHero();
				onHeroRecover();
			}
		}
		catch(err) {
			addLog("Exception: " + err);
			console.log(err);
		}
	}

	loopInterval = setInterval(gameLoop, 1000 / tps);	
});

