use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use eternum::alias::ID;
use eternum::models::config::{TroopConfig, TroopConfigCustomImpl, TroopConfigCustomTrait};


use eternum::models::movable::{Movable, MovableCustomTrait};
use eternum::models::quantity::{Quantity};
use eternum::models::{
    combat::{
        Army, ArmyCustomTrait, TroopsImpl, TroopsTrait, Health, HealthCustomImpl, HealthCustomTrait, BattleCustomImpl,
        BattleCustomTrait, Protector, Protectee, ProtecteeCustomTrait, BattleHealthCustomTrait, BattleEscrowImpl,
    },
};
use eternum::models::{combat::{Troops, Battle, BattleSide}};

#[dojo::interface]
trait IBattleContract<TContractState> {
    /// Initiates a battle between an attacking and defending army within the game world.
    ///
    /// # Preconditions:
    /// - The caller must own the `attacking_army_id`.
    /// - Both `attacking_army_id` and `defending_army_id` must not already be in battle.
    ///   If the attacked army is in a battle that has ended, it is automatically forced
    ///   to leave the battle.
    /// - Both armies must be at the same location.
    ///
    /// # Arguments:
    /// * `world` - The game world dispatcher interface.
    /// * `attacking_army_id` - The id of the attacking army.
    /// * `defending_army_id` - The id of the defending army.
    ///
    /// # Implementation Details:
    /// 1. **Initial Checks and Setup**:
    ///     - Verifies the attacking and defending armies are not already in battle.
    ///     - Ensures the caller owns the attacking army.
    ///     - Checks that both armies are at the same position.
    ///     - Ensure that both armies are alive
    /// 2. **Battle ID Assignment**:
    ///     - Generates a new unique battle ID and assigns it to both armies.
    ///     - Sets the battle side for each army (attack or defense).
    /// 3. **Movement Blocking**:
    ///     - Blocks movement for both armies if they are not protecting any entity.
    /// 4. **Battle Creation**:
    ///     - Initializes the battle with both armies and their respective health.
    ///     - Deposits resources protected by the armies into the battle escrow.
    ///     - Sets the battle position and resets the battle delta.
    ///
    /// # Note:
    ///     This is how the deposited resources are escrowed. Whenever any army joins a
    ///     battle, the items which they are securing are locked from being transferred
    ///     and they will also not be able to receive resources.
    ///
    ///     For example;
    ///     - If an army is not a defensive army, the items they are securing are the items they
    ///     hold.
    ///       So we lock these items. We also transfer the items into the battle escrow pool
    ///
    ///     - If an army is a defensive army, the items they are securing are the items owned
    ///       by the structure they are protecting and so these items are lock. The structures can't
    ///       receive or send any resources.
    ///
    ///       However, for a couple of reasons, we do not transfer resources owned by structures
    ///       into the escrow pool because if a structure is producing resources, it would be
    ///       impossible to continously donate resources into the battle escrow. Even if it was
    ///       possible, it would take too much gas.
    ///
    ///       Instead, what we do is that we just lock up the structure's resources and if you win
    ///       the battle against the structure, you can continuously pillage it without being sent
    ///       back to your base.
    ///
    /// # Returns:
    /// * None
    fn battle_start(ref world: IWorldDispatcher, attacking_army_id: ID, defending_army_id: ID) -> ID;

    /// Force start a battle between two armies
    ///
    /// # Preconditions:
    /// - The caller must own the `defending_army_id`.
    /// - the army must be on the defensive side
    /// - The battle must not have already started
    ///
    /// # Arguments:
    /// * `world` - The game world dispatcher interface.
    /// * `battle_id` - The id of the battle to force start.
    /// * `defending_army_id` - The id of the defending army.
    ///
    fn battle_force_start(ref world: IWorldDispatcher, battle_id: ID, defending_army_id: ID);

    /// Join an existing battle with the specified army, assigning it to a specific side in the
    /// battle.
    ///
    /// # Preconditions:
    /// - The specified `battle_side` must be either `BattleSide::Attack` or `BattleSide::Defence`.
    /// - The caller must own the `army_id`.
    /// - The battle must be ongoing.
    /// - The army must not already be in a battle.
    /// - The army must be at the same location as the battle.
    ///
    /// # Arguments:
    /// * `world` - The game world dispatcher interface.
    /// * `battle_id` - The id of the battle to join.
    /// * `battle_side` - The side to join in the battle (attack or defense).
    /// * `army_id` - The id of the army joining the battle.
    ///
    /// # Implementation Details:
    /// 1. **Initial Checks and Setup**:
    ///     - Ensures the specified `battle_side` is valid (not `BattleSide::None`).
    ///     - Verifies the caller owns the army.
    /// 2. **Battle State Update**:
    ///     - Updates the battle state before performing any other actions.
    ///     - Ensures the battle is still ongoing.
    /// 3. **Army Validations**:
    ///     - Ensures both armies are alive
    ///     - Ensures the army is not already in a battle.
    ///     - Checks that the army is at the same location as the battle.
    /// 4. **Army Assignment to Battle**:
    ///     - Assigns the battle ID and side to the army.
    ///     - Blocks the army's movement if it is not protecting any entity.
    /// 5. **Resource Locking**:
    ///     - Locks the resources protected by the army, transferring them to the battle escrow if
    ///     necessary.
    /// 6. **Troop and Health Addition**:
    ///     - Adds the army's troops and health to the respective side in the battle.
    ///     - Updates the battle state with the new army's contributions.
    /// 7. **Battle Delta Reset**:
    ///     - Resets the battle delta with the troop configuration.
    ///
    /// # Note:
    ///     When an army joins a battle, its protected resources are locked and transferred
    ///     to the battle escrow. This ensures that resources cannot be transferred in or out
    ///     of the army while it is engaged in the battle.
    ///
    ///     For defensive armies, the resources owned by the structures they protect are locked
    ///     but not transferred into the escrow to avoid continuous donation issues.
    ///     see. the `battle_start` function for more info on this
    ///
    /// # Returns:
    /// * None
    fn battle_join(ref world: IWorldDispatcher, battle_id: ID, battle_side: BattleSide, army_id: ID);

    /// Allows an army to leave an ongoing battle, releasing its resources and restoring its
    /// mobility (if it was previously mobile).
    ///
    /// # Preconditions:
    /// - The caller must own the `army_id`.
    /// - The battle ID must match the current battle of the army.
    /// - The army must have a valid battle side (`BattleSide::Attack` or `BattleSide::Defence`).
    ///
    /// # Arguments:
    /// * `world` - The game world dispatcher interface.
    /// * `battle_id` - The id of the battle from which the army is leaving.
    /// * `army_id` - The id of the army leaving the battle.
    ///
    /// # Implementation Details:
    /// 1. **Initial Validations**:
    ///     - Verifies the caller owns the army.
    ///     - Updates the state of the battle before any actions.
    /// 2. **Battle Validation**:
    ///     - Ensures the battle ID matches the army's current battle ID.
    ///     - Checks that the army is participating in a valid battle side.
    /// 3. **Army Restoration**:
    ///     - Restores mobility for the army if it is not protecting any entity.
    ///     - Withdraws any resources stuck in the battle escrow and any rewards due.
    /// 4. **Resource and Troop Management**:
    ///     - Deducts the army's original troops and health from the battle army.
    ///     - Adjusts the army's health based on its remaining battle contribution.
    /// 5. **Battle State Update**:
    ///     - Updates the battle with the adjusted troop and health values.
    ///     - Resets the battle delta
    /// 6. **Final Army State Update**:
    ///     - Clears the army's battle ID and battle side, indicating it is no longer in battle.
    ///
    /// # Notes on Reward:
    ///     -   If you leave in the middle of a battle that doesn't yet have a decided outcome,
    ///         you lose all the resources deposited in the battle escrow.
    ///
    ///         Because Structures` rescources are not deposited into escrow, and so we can't make
    ///         them lose all their resources, structure defensive armies CAN NOT leave a battle
    ///         until it is done. There must be a winner, loser or it must have been a draw
    ///
    ///     -   If you leave after a battle has ended;
    ///             a. if you won, you leave with your initial resources and you also take a portion
    ///                 of the resources deposited in escrow by the opposing team based on the
    ///                 number of troops you contributed to the battle.
    ///
    ///                 This method has the downside that a big army can just swoop in, close to the
    ///                 end of the battle, and take the giant share of the loot. But such is life.
    ///
    ///                 If you won against a structure, you can pillage them to infinity.
    ///
    ///             b. if you lost, you lose all the resources deposited in escrow
    ///             c. if the battle was drawn, you can leave with your deposited resources
    ///
    /// # Returns:
    /// * None
    fn battle_leave(ref world: IWorldDispatcher, battle_id: ID, army_id: ID);

    /// Claims ownership of a non realm structure by an army after meeting all necessary conditions.
    ///
    /// # Preconditions:
    /// - The caller must own the `army_id`.
    /// - The entity being claimed (`structure_id`) must be a valid structure.
    /// - The structure must not be a realm (StructureCategory::Realm).
    /// - The claiming army (`army_id`) must not be currently in battle.
    /// - The claiming army must be at the same location as the structure.
    /// - If the structure has a defensive army, that army must be dead (in battle or otherwise).
    ///
    /// # Arguments:
    /// * `world` - The game world dispatcher interface.
    /// * `army_id` - The id of the army claiming ownership of the structure.
    /// * `structure_id` - The id of the structure being claimed.
    ///
    /// # Implementation Details:
    /// 1. **Initial Validations**:
    ///     - Verifies the caller owns the army (`army_id`).
    ///     - Ensures the entity being claimed is indeed a structure.
    ///     - Checks that the structure is not a realm, which cannot be claimed.
    /// 2. **Location and Battle Checks**:
    ///     - Confirms that the claiming army is not currently in battle.
    ///     - Verifies that the claiming army is at the same location as the structure.
    ///     - Checks if the structure has a defensive army (`structure_army_id`).
    ///     - If the structure has a defensive army, ensures that army is dead.
    /// 4. **Ownership Transfer**:
    ///     - Transfers ownership of the structure to the claiming army.
    ///
    /// # Note:
    ///     - This function is used to transfer ownership of non-realm structures.
    ///     - Realms cannot be claimed due to their unique status in the game.
    ///
    /// # Returns:
    /// * None
    fn battle_claim(ref world: IWorldDispatcher, army_id: ID, structure_id: ID);
}


#[dojo::interface]
trait IBattlePillageContract<TContractState> {
    /// Pillage a structure.
    ///
    /// # Preconditions:
    /// - The caller must own the `army_id`.
    /// - The entity being pillaged (`structure_id`) must be a valid structure.
    /// - The attacking army (`army_id`) must not be currently in battle.
    /// - The attacking army must be at the same location as the structure.
    /// - If the structure has a protecting army in battle, the attacking army must join the battle
    ///   or wait till the structure's defensive army is done with the battle.
    ///
    /// # Arguments:
    /// * `world` - The game world dispatcher interface.
    /// * `army_id` - The id of the attacking army.
    /// * `structure_id` - The id of the structure being pillaged.
    ///
    /// # Implementation Details:
    /// 1. **Initial Validations**:
    ///     - Verifies the caller owns the attacking army (`army_id`).
    ///     - Ensures the entity being pillaged is indeed a structure.
    ///     - Checks that the attacking army is not currently in battle.
    ///     - Confirms that the attacking army is at the same location as the structure.
    /// 2. **Protection Check**:
    ///     - Determines if the structure is protected by another army (`structure_army_id`).
    ///     - If the protecting army is in battle, ensure that outcome is finalized.
    /// 3. **Pillage Calculation**:
    ///     - Calculates the strength of the attacking and defending armies based on their troops
    ///     and health.
    ///     - Uses a probabilistic model to determine if the pillaging attempt is successful.
    ///     - Randomly selects resources from the structure to pillage, considering army capacity
    ///     and resource availability.
    /// 4. **Outcome Effects**:
    ///     - If the pillage attempt is successful, transfers resources from the structure to the
    ///     attacking army.
    ///     - Optionally destroys a building within the structure based on specific conditions.
    ///     - Deducts health from both armies involved in the battle.
    ///         If any army is dead, no health is deducted.
    ///
    /// 5. **Final Actions**:
    ///     - Handles the movement of the attacking army back to its owner after a successful
    ///     pillage,
    ///       if continuous pillaging is not possible.
    ///     - Emits a `BattlePillageData` to signify the outcome of the pillage action.
    ///
    /// # Note:
    ///     - Continous pillaging simply means you are allowed to pillage without being sent back
    ///       to base if the structure army is dead.
    ///
    /// # Returns:
    /// * None
    fn battle_pillage(ref world: IWorldDispatcher, army_id: ID, structure_id: ID);
}


#[dojo::contract]
mod battle_systems {
    use eternum::alias::ID;
    use eternum::constants::{
        ResourceTypes, ErrorMessages, get_resources_without_earthenshards, get_resources_without_earthenshards_probs
    };
    use eternum::constants::{MAX_PILLAGE_TRIAL_COUNT, RESOURCE_PRECISION};
    use eternum::models::buildings::{Building, BuildingCustomImpl, BuildingCategory, BuildingQuantityv2,};
    use eternum::models::combat::{BattleEscrowTrait, ProtectorCustomTrait};
    use eternum::models::config::{
        TickConfig, TickImpl, TickTrait, SpeedConfig, TroopConfig, TroopConfigCustomImpl, TroopConfigCustomTrait,
        BattleConfig, BattleConfigCustomImpl, BattleConfigCustomTrait, CapacityConfig, CapacityConfigCustomImpl,
        CapacityConfigCategory
    };
    use eternum::models::config::{WeightConfig, WeightConfigCustomImpl};
    use eternum::models::event::{
        EternumEvent, EventType, EventData, BattleStartData, BattleJoinData, BattleLeaveData, BattleClaimData,
        BattlePillageData
    };

    use eternum::models::movable::{Movable, MovableCustomTrait};
    use eternum::models::name::{AddressName};
    use eternum::models::owner::{EntityOwner, EntityOwnerCustomImpl, EntityOwnerCustomTrait, Owner, OwnerCustomTrait};
    use eternum::models::position::CoordTrait;
    use eternum::models::position::{Position, Coord, PositionCustomTrait, Direction};
    use eternum::models::quantity::{Quantity, QuantityTracker};
    use eternum::models::realm::Realm;
    use eternum::models::resources::{Resource, ResourceCustomImpl, ResourceCost};
    use eternum::models::resources::{ResourceTransferLock, ResourceTransferLockCustomTrait};

    use eternum::models::season::SeasonImpl;
    use eternum::models::stamina::{Stamina, StaminaCustomTrait};
    use eternum::models::structure::{Structure, StructureCustomTrait, StructureCategory};
    use eternum::models::weight::Weight;

    use eternum::models::{
        combat::{
            Army, ArmyCustomTrait, Troops, TroopsImpl, TroopsTrait, Health, HealthCustomImpl, HealthCustomTrait, Battle,
            BattleCustomImpl, BattleCustomTrait, BattleSide, Protector, Protectee, ProtecteeCustomTrait,
            BattleHealthCustomTrait, BattleEscrowImpl, AttackingArmyQuantityTrackerCustomTrait,
            AttackingArmyQuantityTrackerCustomImpl,
        },
    };
    use eternum::systems::resources::contracts::resource_systems::resource_systems::{InternalResourceSystemsImpl};

    use eternum::utils::math::{PercentageValueImpl, PercentageImpl};
    use eternum::utils::math::{min, max};
    use eternum::utils::random;

    use super::{IBattleContract, InternalBattleImpl};


    #[abi(embed_v0)]
    impl BattleContractImpl of IBattleContract<ContractState> {
        fn battle_start(ref world: IWorldDispatcher, attacking_army_id: ID, defending_army_id: ID) -> ID {
            SeasonImpl::assert_season_is_not_over(world);

            let mut attacking_army: Army = get!(world, attacking_army_id, Army);
            attacking_army.assert_not_in_battle();

            let attacking_army_entity_owner = get!(world, attacking_army_id, EntityOwner);
            attacking_army_entity_owner.assert_caller_owner(world);

            let armies_tick_config = TickImpl::get_armies_tick_config(world);
            let battle_config = BattleConfigCustomImpl::get(world);

            let mut defending_army: Army = get!(world, defending_army_id, Army);
            let defending_army_owner_entity_id = get!(world, defending_army_id, EntityOwner).entity_owner_id;

            let defending_army_owner_structure = get!(world, defending_army_owner_entity_id, Structure);
            if defending_army_owner_structure.category != StructureCategory::None {
                defending_army_owner_structure.assert_can_be_attacked(battle_config, armies_tick_config);
            }

            let attacking_army_owner_entity_id = attacking_army_entity_owner.entity_owner_id;
            let attacking_army_owner_structure = get!(world, attacking_army_owner_entity_id, Structure);
            if attacking_army_owner_structure.category != StructureCategory::None {
                attacking_army_owner_structure.assert_can_be_attacked(battle_config, armies_tick_config);
            }

            if defending_army.battle_id.is_non_zero() {
                // defending army appears to be in battle
                // so we want to update the defending army's battle status
                // to see if the battle has ended. if it has ended, then the
                // army will be removed from the battle
                let mut defending_army_battle = BattleCustomImpl::get(world, defending_army.battle_id);
                InternalBattleImpl::leave_battle_if_ended(world, ref defending_army_battle, ref defending_army);
                set!(world, (defending_army_battle))
            }
            // ensure defending army is not in battle
            defending_army.assert_not_in_battle();

            let troop_config = TroopConfigCustomImpl::get(world);
            let attacking_army_health: Health = get!(world, attacking_army_id, Health);
            let defending_army_health: Health = get!(world, defending_army_id, Health);
            // ensure health invariant checks pass
            assert!(
                attacking_army_health.current == attacking_army.troops.full_health(troop_config),
                "attacking army health sanity check fail"
            );
            assert!(
                defending_army_health.current == defending_army.troops.full_health(troop_config),
                "defending army health sanity check fail"
            );

            // ensure both armies are alive
            attacking_army_health.assert_alive("your army");
            defending_army_health.assert_alive("the army you are attacking");

            // ensure both armies are in the same location
            let attacking_army_position: Position = get!(world, attacking_army_id, Position);
            let defending_army_position: Position = get!(world, defending_army_id, Position);
            attacking_army_position.assert_same_location(defending_army_position.into());

            let battle_id: ID = world.uuid();
            attacking_army.battle_id = battle_id;
            attacking_army.battle_side = BattleSide::Attack;
            set!(world, (attacking_army));

            defending_army.battle_id = battle_id;
            defending_army.battle_side = BattleSide::Defence;
            set!(world, (defending_army));

            let mut attacking_army_protectee: Protectee = get!(world, attacking_army_id, Protectee);
            let mut attacking_army_movable: Movable = get!(world, attacking_army_id, Movable);
            if attacking_army_protectee.is_none() {
                attacking_army_movable.assert_moveable();
                attacking_army_movable.blocked = true;
                set!(world, (attacking_army_movable));
            }

            let mut defending_army_protectee: Protectee = get!(world, defending_army_id, Protectee);
            let mut defending_army_movable: Movable = get!(world, defending_army_id, Movable);
            if defending_army_protectee.is_none() {
                defending_army_movable.assert_moveable();
                defending_army_movable.blocked = true;
                set!(world, (defending_army_movable));
            }

            // create battle
            let now = starknet::get_block_timestamp();
            let mut battle: Battle = Default::default();
            battle.entity_id = battle_id;
            battle.attack_army = attacking_army.into();
            battle.attack_army_lifetime = attacking_army.into();
            battle.defence_army = defending_army.into();
            battle.defence_army_lifetime = defending_army.into();
            battle.attackers_resources_escrow_id = world.uuid();
            battle.defenders_resources_escrow_id = world.uuid();
            battle.attack_army_health = attacking_army_health.into();
            battle.defence_army_health = defending_army_health.into();
            battle.last_updated = now;
            battle.start_at = now;
            // add battle start time delay when a structure is being attacked.
            // if the structure is the attacker, the battle starts immediately
            if defending_army_protectee.is_other() {
                battle.start_at = now + battle_config.battle_delay_seconds;
            }

            // deposit resources protected by armies into battle escrow pots/boxes
            battle.deposit_balance(world, attacking_army, attacking_army_protectee);
            battle.deposit_balance(world, defending_army, defending_army_protectee);

            // set battle position
            let mut battle_position: Position = Default::default();
            battle_position.entity_id = battle_id;
            battle_position.x = attacking_army_position.x;
            battle_position.y = attacking_army_position.y;
            set!(world, (battle_position));

            battle.reset_delta(troop_config);

            set!(world, (battle));

            let id = world.uuid();

            let attacker = starknet::get_caller_address();
            let defender_entity_owner = get!(world, defending_army_id, EntityOwner).entity_owner_id;
            let defender = get!(world, defender_entity_owner, Owner).address;

            let protectee = get!(world, defending_army_id, Protectee).protectee_id;
            let defender_structure = get!(world, protectee, Structure);
            emit!(
                world,
                BattleStartData {
                    id,
                    event_id: EventType::BattleStart,
                    battle_entity_id: battle_id,
                    attacker,
                    attacker_name: get!(world, starknet::get_caller_address(), AddressName).name,
                    attacker_army_entity_id: attacking_army_id,
                    defender_name: get!(world, defender, AddressName).name,
                    defender,
                    defender_army_entity_id: defending_army_id,
                    duration_left: battle.duration_left,
                    x: battle_position.x,
                    y: battle_position.y,
                    structure_type: defender_structure.category,
                    timestamp: starknet::get_block_timestamp(),
                }
            );
            battle_id
        }

        fn battle_force_start(ref world: IWorldDispatcher, battle_id: ID, defending_army_id: ID) {
            SeasonImpl::assert_season_is_not_over(world);

            get!(world, defending_army_id, EntityOwner).assert_caller_owner(world);

            let mut defending_army: Army = get!(world, defending_army_id, Army);
            assert!(defending_army.battle_id == battle_id, "army is not in battle");
            assert!(defending_army.battle_side == BattleSide::Defence, "army is not on defensive");

            let mut defending_army_protectee: Protectee = get!(world, defending_army_id, Protectee);
            // this condition should not be possible unless there is a bug in `battle_start`
            assert!(defending_army_protectee.is_other(), "only structures can force start");

            let now = starknet::get_block_timestamp();
            let mut battle = BattleCustomImpl::get(world, battle_id);
            assert!(now < battle.start_at, "Battle already started");

            // update battle
            battle.start_at = now;
            battle.deposit_lock_immediately(world, defending_army_protectee);
            set!(world, (battle));
        }

        fn battle_join(ref world: IWorldDispatcher, battle_id: ID, battle_side: BattleSide, army_id: ID) {
            SeasonImpl::assert_season_is_not_over(world);

            assert!(battle_side != BattleSide::None, "choose correct battle side");

            // ensure caller owns army
            get!(world, army_id, EntityOwner).assert_caller_owner(world);

            // ensure battle has not ended
            let mut battle = BattleCustomImpl::get(world, battle_id);
            assert!(!battle.has_ended(), "Battle has ended");

            // ensure caller army is not in battle
            let mut caller_army: Army = get!(world, army_id, Army);
            caller_army.assert_not_in_battle();

            // ensure caller army is not dead
            let mut caller_army_health: Health = get!(world, army_id, Health);
            caller_army_health.assert_alive("Your army");

            // caller army health sanity check
            let troop_config = TroopConfigCustomImpl::get(world);
            assert!(
                caller_army_health.current == caller_army.troops.full_health(troop_config),
                "caller health sanity check fail"
            );

            // ensure caller army is at battle location
            let caller_army_position = get!(world, caller_army.entity_id, Position);
            let battle_position = get!(world, battle.entity_id, Position);
            caller_army_position.assert_same_location(battle_position.into());

            caller_army.battle_id = battle_id;
            caller_army.battle_side = battle_side;
            set!(world, (caller_army));

            // make caller army immovable
            let mut caller_army_protectee: Protectee = get!(world, army_id, Protectee);
            let mut caller_army_movable: Movable = get!(world, army_id, Movable);
            if caller_army_protectee.is_none() {
                caller_army_movable.assert_moveable();
                caller_army_movable.blocked = true;
                set!(world, (caller_army_movable));
            }

            // lock resources being protected by army
            battle.deposit_balance(world, caller_army, caller_army_protectee);

            // add troops to battle army troops
            let troop_config = TroopConfigCustomImpl::get(world);
            battle.join(battle_side, caller_army.troops, caller_army_health.current);
            battle.reset_delta(troop_config);
            set!(world, (battle));

            let id = world.uuid();
            let joiner = starknet::get_caller_address();

            emit!(
                world,
                BattleJoinData {
                    id,
                    event_id: EventType::BattleJoin,
                    battle_entity_id: battle_id,
                    joiner,
                    joiner_name: get!(world, starknet::get_caller_address(), AddressName).name,
                    joiner_army_entity_id: army_id,
                    joiner_side: battle_side,
                    duration_left: battle.duration_left,
                    x: battle_position.x,
                    y: battle_position.y,
                    timestamp: starknet::get_block_timestamp(),
                }
            );
        }


        fn battle_leave(ref world: IWorldDispatcher, battle_id: ID, army_id: ID) {
            SeasonImpl::assert_season_is_not_over(world);

            // ensure caller owns army
            get!(world, army_id, EntityOwner).assert_caller_owner(world);

            // ensure caller is in the correct battle
            let mut caller_army: Army = get!(world, army_id, Army);
            assert!(caller_army.battle_id == battle_id, "wrong battle id");
            assert!(caller_army.battle_side != BattleSide::None, "choose correct battle side");

            let caller_army_side = caller_army.battle_side;

            // get battle
            let mut battle = BattleCustomImpl::get(world, battle_id);

            // check if army left early
            let army_left_early = !battle.has_ended();

            // leave battle
            InternalBattleImpl::leave_battle(world, ref battle, ref caller_army);

            // slash army if battle was not concluded before they left
            if army_left_early {
                let troop_config = TroopConfigCustomImpl::get(world);
                let mut army = get!(world, army_id, Army);
                let troops_deducted = Troops {
                    knight_count: (army.troops.knight_count * troop_config.battle_leave_slash_num.into())
                        / troop_config.battle_leave_slash_denom.into(),
                    paladin_count: (army.troops.paladin_count * troop_config.battle_leave_slash_num.into())
                        / troop_config.battle_leave_slash_denom.into(),
                    crossbowman_count: (army.troops.crossbowman_count * troop_config.battle_leave_slash_num.into())
                        / troop_config.battle_leave_slash_denom.into(),
                };
                army.troops.deduct(troops_deducted);
                army.troops.normalize_counts();

                let army_health = Health {
                    entity_id: army_id,
                    current: army.troops.full_health(troop_config),
                    lifetime: army.troops.full_health(troop_config)
                };

                let army_quantity = Quantity { entity_id: army_id, value: army.troops.count().into() };
                set!(world, (army, army_health, army_quantity));
            }

            // emit battle leave event
            let battle_position = get!(world, battle_id, Position);
            emit!(
                world,
                BattleLeaveData {
                    id: world.uuid(),
                    event_id: EventType::BattleLeave,
                    battle_entity_id: battle_id,
                    leaver: starknet::get_caller_address(),
                    leaver_name: get!(world, starknet::get_caller_address(), AddressName).name,
                    leaver_army_entity_id: army_id,
                    leaver_side: caller_army_side,
                    duration_left: battle.duration_left,
                    x: battle_position.x,
                    y: battle_position.y,
                    timestamp: starknet::get_block_timestamp(),
                }
            );
        }


        fn battle_claim(ref world: IWorldDispatcher, army_id: ID, structure_id: ID) {
            SeasonImpl::assert_season_is_not_over(world);

            // ensure caller owns army
            get!(world, army_id, EntityOwner).assert_caller_owner(world);

            // ensure entity being claimed is a structure
            let structure: Structure = get!(world, structure_id, Structure);
            structure.assert_is_structure();

            let armies_tick_config = TickImpl::get_armies_tick_config(world);
            let battle_config = BattleConfigCustomImpl::get(world);
            structure.assert_can_be_attacked(battle_config, armies_tick_config);

            // ensure claimer army is not in battle
            let claimer_army: Army = get!(world, army_id, Army);
            claimer_army.assert_not_in_battle();

            // ensure army is at structure position
            let claimer_army_position: Position = get!(world, army_id, Position);
            let structure_position: Position = get!(world, structure_id, Position);
            claimer_army_position.assert_same_location(structure_position.into());

            // ensure structure has no army protecting it
            let structure_army_id: ID = get!(world, structure_id, Protector).army_id;
            if structure_army_id.is_non_zero() {
                let mut structure_army: Army = get!(world, structure_army_id, Army);
                if structure_army.is_in_battle() {
                    let mut battle = BattleCustomImpl::get(world, structure_army.battle_id);
                    InternalBattleImpl::leave_battle_if_ended(world, ref battle, ref structure_army);
                }

                // ensure structure army is dead
                let structure_army_health: Health = get!(world, structure_army_id, Health);
                assert!(!structure_army_health.is_alive(), "can only claim when structure army is dead");
            }

            // transfer structure ownership to claimer
            let claimer = starknet::get_caller_address();
            let mut structure_owner: Owner = get!(world, structure_id, Owner);
            let structure_owner_before_transfer = structure_owner.address;
            structure_owner.transfer(claimer);
            set!(world, (structure_owner));

            // emit battle claim event
            let structure_position = get!(world, structure_id, Position);
            emit!(
                world,
                BattleClaimData {
                    id: world.uuid(),
                    event_id: EventType::BattleClaim,
                    structure_entity_id: structure_id,
                    claimer,
                    claimer_name: get!(world, claimer, AddressName).name,
                    claimer_army_entity_id: army_id,
                    previous_owner: structure_owner_before_transfer,
                    x: structure_position.x,
                    y: structure_position.y,
                    structure_type: structure.category,
                    timestamp: starknet::get_block_timestamp(),
                }
            );
        }
    }
}

#[dojo::contract]
mod battle_pillage_systems {
    use eternum::alias::ID;
    use eternum::constants::{
        ResourceTypes, ErrorMessages, get_resources_without_earthenshards, get_resources_without_earthenshards_probs
    };
    use eternum::constants::{MAX_PILLAGE_TRIAL_COUNT, RESOURCE_PRECISION};
    use eternum::models::buildings::{Building, BuildingCustomImpl, BuildingCategory, BuildingQuantityv2,};
    use eternum::models::combat::{BattleEscrowTrait, ProtectorCustomTrait};
    use eternum::models::config::{
        TickConfig, TickImpl, TickTrait, SpeedConfig, TroopConfig, TroopConfigCustomImpl, TroopConfigCustomTrait,
        BattleConfig, BattleConfigCustomImpl, BattleConfigCustomTrait, CapacityConfig, CapacityConfigCustomImpl,
        CapacityConfigCategory
    };
    use eternum::models::config::{WeightConfig, WeightConfigCustomImpl};
    use eternum::models::event::{
        EternumEvent, EventType, EventData, BattleStartData, BattleJoinData, BattleLeaveData, BattleClaimData,
        BattlePillageData
    };

    use eternum::models::movable::{Movable, MovableCustomTrait};
    use eternum::models::name::{AddressName};
    use eternum::models::owner::{EntityOwner, EntityOwnerCustomImpl, EntityOwnerCustomTrait, Owner, OwnerCustomTrait};
    use eternum::models::position::CoordTrait;
    use eternum::models::position::{Position, Coord, PositionCustomTrait, Direction};
    use eternum::models::quantity::{Quantity, QuantityTracker};
    use eternum::models::realm::Realm;
    use eternum::models::resources::{Resource, ResourceCustomImpl, ResourceCost};
    use eternum::models::resources::{ResourceTransferLock, ResourceTransferLockCustomTrait};

    use eternum::models::season::SeasonImpl;
    use eternum::models::stamina::{Stamina, StaminaCustomTrait};
    use eternum::models::structure::{Structure, StructureCustomTrait, StructureCategory};
    use eternum::models::weight::Weight;

    use eternum::models::{
        combat::{
            Army, ArmyCustomTrait, Troops, TroopsImpl, TroopsTrait, Health, HealthCustomImpl, HealthCustomTrait, Battle,
            BattleCustomImpl, BattleCustomTrait, BattleSide, Protector, Protectee, ProtecteeCustomTrait,
            BattleHealthCustomTrait, BattleEscrowImpl, AttackingArmyQuantityTrackerCustomTrait,
            AttackingArmyQuantityTrackerCustomImpl,
        },
    };
    use eternum::systems::resources::contracts::resource_systems::resource_systems::{InternalResourceSystemsImpl};

    use eternum::utils::math::{PercentageValueImpl, PercentageImpl};
    use eternum::utils::math::{min, max};
    use eternum::utils::random;

    use super::{IBattlePillageContract, InternalBattleImpl};


    #[abi(embed_v0)]
    impl BattlePillageContractImpl of IBattlePillageContract<ContractState> {
        fn battle_pillage(ref world: IWorldDispatcher, army_id: ID, structure_id: ID,) {
            SeasonImpl::assert_season_is_not_over(world);

            // ensure caller owns army
            get!(world, army_id, EntityOwner).assert_caller_owner(world);

            // ensure entity being pillaged is a structure
            let structure: Structure = get!(world, structure_id, Structure);
            structure.assert_is_structure();
            let armies_tick_config = TickImpl::get_armies_tick_config(world);
            let battle_config = BattleConfigCustomImpl::get(world);
            structure.assert_can_be_attacked(battle_config, armies_tick_config);

            // ensure attacking army is not in a battle
            let mut attacking_army: Army = get!(world, army_id, Army);
            attacking_army.assert_not_in_battle();

            // ensure army is at structure position
            let army_position: Position = get!(world, army_id, Position);
            let structure_position: Position = get!(world, structure_id, Position);
            army_position.assert_same_location(structure_position.into());

            // ensure army has stamina
            let mut army_stamina: Stamina = get!(world, army_id, Stamina);
            army_stamina.refill_if_next_tick(world);
            assert!(army_stamina.amount.is_non_zero(), "army needs stamina to pillage");

            let troop_config = TroopConfigCustomImpl::get(world);

            // get structure army and health

            let structure_army_id: ID = get!(world, structure_id, Protector).army_id;
            assert!(structure_army_id != army_id, "self attack");

            let mut structure_army: Army = Default::default();
            let mut structure_army_health: Health = Default::default();
            if structure_army_id.is_non_zero() {
                structure_army = get!(world, structure_army_id, Army);
                if structure_army.is_in_battle() {
                    let mut battle = BattleCustomImpl::get(world, structure_army.battle_id);
                    InternalBattleImpl::leave_battle_if_ended(world, ref battle, ref structure_army);
                }

                // get accurate structure army health
                structure_army_health = get!(world, structure_army_id, Health);
            }

            // a percentage of it's full strength depending on structure army's health
            let mut structure_army_strength = structure_army.troops.full_strength(troop_config)
                * structure_army_health.percentage_left()
                / PercentageValueImpl::_100().into();

            // a percentage of it's full strength depending on structure army's health
            let mut attacking_army_health: Health = get!(world, army_id, Health);
            attacking_army_health.assert_alive("Army");

            let mut attacking_army_strength = attacking_army.troops.full_strength(troop_config)
                * attacking_army_health.percentage_left()
                / PercentageValueImpl::_100().into();

            let attack_successful: @bool = random::choices(
                array![true, false].span(),
                array![attacking_army_strength, structure_army_strength].span(),
                array![].span(),
                1,
                true
            )[0];

            let mut pillaged_resources: Array<(u8, u128)> = array![(0, 0)];
            if *attack_successful {
                let attack_success_probability = attacking_army_strength
                    * PercentageValueImpl::_100().into()
                    / max((attacking_army_strength + structure_army_strength), 1);

                // choose x random resource to be stolen
                let mut chosen_resource_types: Span<u8> = random::choices(
                    get_resources_without_earthenshards(),
                    get_resources_without_earthenshards_probs(),
                    array![].span(),
                    MAX_PILLAGE_TRIAL_COUNT.try_into().unwrap(),
                    true
                );

                loop {
                    match chosen_resource_types.pop_front() {
                        Option::Some(chosen_resource_type) => {
                            let pillaged_resource_from_structure: Resource = ResourceCustomImpl::get(
                                world, (structure_id, *chosen_resource_type)
                            );

                            if pillaged_resource_from_structure.balance > 0 {
                                // find out the max resource amount carriable given entity's weight
                                let army_capacity_config: CapacityConfig = get!(
                                    world, CapacityConfigCategory::Army, CapacityConfig
                                );

                                // Divided by resource precision because we need capacity in gram
                                // per client unit
                                let army_total_capacity = army_capacity_config.weight_gram
                                    * attacking_army.troops.count().into()
                                    / RESOURCE_PRECISION;

                                let army_weight: Weight = get!(world, army_id, Weight);

                                let max_carriable = (army_total_capacity - (army_weight.value))
                                    / max(
                                        (WeightConfigCustomImpl::get_weight_grams(world, *chosen_resource_type, 1)), 1
                                    );

                                if max_carriable > 0 {
                                    let max_resource_amount_stolen: u128 = attacking_army.troops.count().into()
                                        * attack_success_probability.into()
                                        / PercentageValueImpl::_100().into();

                                    let resource_amount_stolen: u128 = min(
                                        pillaged_resource_from_structure.balance, max_resource_amount_stolen
                                    );

                                    let resource_amount_stolen: u128 = min(max_carriable, resource_amount_stolen);

                                    // express resource amount stolen to be a percentage of stamina
                                    // left
                                    let resource_amount_stolen: u128 = (resource_amount_stolen
                                        * army_stamina.amount.into())
                                        / army_stamina.max(world).into();

                                    if resource_amount_stolen.is_non_zero() {
                                        pillaged_resources.append((*chosen_resource_type, resource_amount_stolen));
                                        InternalResourceSystemsImpl::transfer(
                                            world,
                                            structure_id,
                                            army_id,
                                            array![(*chosen_resource_type, resource_amount_stolen)].span(),
                                            army_id,
                                            true,
                                            true
                                        );
                                    }

                                    break;
                                }
                            }
                        },
                        Option::None => { break; }
                    }
                };
            }

            // drain stamina
            army_stamina.drain(world);

            // destroy a building
            let mut destroyed_building_category = BuildingCategory::None;
            if structure.category == StructureCategory::Realm {
                // all buildings are at most 4 directions from the center
                // so first we pick a random between within 1 and 4
                // with higher probability of high numbers

                let mut chosen_direction_count: u8 = *random::choices(
                    array![1_u8, 2, 3, 4].span(), // options are (1,2,3,4)
                    array![1, 7, 14, 30].span(), // these are the weights of each option
                    array![].span(),
                    1,
                    true
                )[0];

                // make different sets of direction arrangements so the targeted
                // building locations aren't clustered or so they arent facing only one direction
                let direction_arrangements = array![
                    array![
                        Direction::East,
                        Direction::NorthEast,
                        Direction::NorthWest,
                        Direction::West,
                        Direction::SouthWest,
                        Direction::SouthEast
                    ],
                    array![
                        Direction::SouthWest,
                        Direction::SouthEast,
                        Direction::East,
                        Direction::NorthEast,
                        Direction::NorthWest,
                        Direction::West,
                    ],
                    array![
                        Direction::NorthWest,
                        Direction::West,
                        Direction::SouthWest,
                        Direction::SouthEast,
                        Direction::East,
                        Direction::NorthEast,
                    ],
                    array![
                        Direction::NorthWest,
                        Direction::NorthEast,
                        Direction::SouthWest,
                        Direction::SouthEast,
                        Direction::East,
                        Direction::West
                    ],
                ];
                // move `chosen_direction_count` steps from the center in random directions
                let mut chosen_directions: Span<Direction> = random::choices(
                    direction_arrangements
                        .at(
                            // choose one arrangement at random
                            *random::choices(
                                array![0_u32, 1, 2, 3].span(), // options are (0,1,2,3) i.e index
                                array![1, 1, 1, 1].span(), // each carry the same weight so equal probs
                                array![].span(),
                                1,
                                true
                            )[0]
                        )
                        .span(),
                    array![1, 2, 4, 7, 11, 15]
                        .span(), // direction weights are in ascending order so the last 3 carry the most weight
                    array![].span(),
                    chosen_direction_count.into(),
                    true
                );

                let mut final_coord = BuildingCustomImpl::center();
                loop {
                    match chosen_directions.pop_front() {
                        Option::Some(direction) => { final_coord = final_coord.neighbor(*direction); },
                        Option::None => { break; }
                    }
                };

                if final_coord != BuildingCustomImpl::center() {
                    // check if there is a building at the destination coordinate
                    let mut pillaged_building: Building = get!(
                        world, (structure_position.x, structure_position.y, final_coord.x, final_coord.y), Building
                    );
                    if pillaged_building.entity_id.is_non_zero() {
                        // destroy building if it exists
                        let building_category = BuildingCustomImpl::destroy(world, structure_id, final_coord);
                        destroyed_building_category = building_category;
                    }
                }
            }

            // Deduct health from both armies if structure has an army
            if structure_army_health.is_alive() {
                let mut mock_battle: Battle = Battle {
                    entity_id: 45,
                    attack_army: attacking_army.into(),
                    attack_army_lifetime: attacking_army.into(),
                    defence_army: structure_army.into(),
                    defence_army_lifetime: structure_army.into(),
                    attackers_resources_escrow_id: 0,
                    defenders_resources_escrow_id: 0,
                    attack_army_health: attacking_army_health.into(),
                    defence_army_health: structure_army_health.into(),
                    attack_delta: 0,
                    defence_delta: 0,
                    last_updated: starknet::get_block_timestamp(),
                    duration_left: 0,
                    start_at: starknet::get_block_timestamp()
                };
                mock_battle.reset_delta(troop_config);

                // reset attacking army health and troop count
                attacking_army_health
                    .decrease_current_by(
                        ((mock_battle.defence_delta.into() * mock_battle.duration_left.into())
                            / troop_config.pillage_health_divisor.into())
                    );

                attacking_army.troops.reset_count_and_health(ref attacking_army_health, troop_config);
                let attacking_army_quantity = Quantity {
                    entity_id: attacking_army.entity_id, value: attacking_army.troops.count().into()
                };
                set!(world, (attacking_army, attacking_army_health, attacking_army_quantity));

                // reset structure army health and troop count
                structure_army_health
                    .decrease_current_by(
                        ((mock_battle.attack_delta.into() * mock_battle.duration_left.into())
                            / troop_config.pillage_health_divisor.into())
                    );
                structure_army.troops.reset_count_and_health(ref structure_army_health, troop_config);

                let structure_army_quantity = Quantity {
                    entity_id: structure_army_id, value: structure_army.troops.count().into()
                };
                set!(world, (structure_army, structure_army_health, structure_army_quantity));
            }

            // emit pillage event
            let army_owner_entity_id: ID = get!(world, army_id, EntityOwner).entity_owner_id;
            let structure_owner = get!(world, structure_id, Owner).address;
            emit!(
                world,
                BattlePillageData {
                    id: world.uuid(),
                    event_id: EventType::BattlePillage,
                    pillager: starknet::get_caller_address(),
                    pillager_name: get!(world, starknet::get_caller_address(), AddressName).name,
                    pillager_realm_entity_id: army_owner_entity_id,
                    pillager_army_entity_id: army_id,
                    pillaged_structure_owner: structure_owner,
                    pillaged_structure_entity_id: structure_id,
                    winner: if *attack_successful {
                        BattleSide::Attack
                    } else {
                        BattleSide::Defence
                    },
                    x: structure_position.x,
                    y: structure_position.y,
                    structure_type: structure.category,
                    pillaged_resources: pillaged_resources.span(),
                    destroyed_building_category,
                    timestamp: starknet::get_block_timestamp(),
                }
            );
        }
    }
}


#[generate_trait]
pub impl InternalBattleImpl of InternalBattleTrait {
    fn leave_battle_if_ended(world: IWorldDispatcher, ref battle: Battle, ref army: Army) {
        assert!(battle.entity_id == army.battle_id, "army must be in same battle");
        if battle.has_ended() {
            // leave battle to update structure army's health
            Self::leave_battle(world, ref battle, ref army);
        }
    }


    /// Make army leave battle
    fn leave_battle(world: IWorldDispatcher, ref battle: Battle, ref original_army: Army) {
        // make caller army mobile again
        let army_id = original_army.entity_id;
        let mut army_protectee: Protectee = get!(world, army_id, Protectee);
        let mut army_movable: Movable = get!(world, army_id, Movable);
        if army_protectee.is_none() {
            army_movable.assert_blocked();
            army_movable.blocked = false;
            set!(world, (army_movable));
        } else {
            assert!(battle.has_ended(), "structure can only leave battle after it ends");
        }

        // get normalized share of army left after battle
        let army_left = battle.get_troops_share_left(original_army);

        // update army quantity to correct value before calling `withdraw_balance_and_reward`
        // because it is used to calculate the loot amount sent to army if it wins the battle
        // i.e when the `withdraw_balance_and_reward` calls
        // `InternalResourceSystemsImpl::mint_if_adequate_capacity`
        let army_quantity_left = Quantity { entity_id: army_id, value: army_left.troops.count().into() };
        set!(world, (army_quantity_left));

        // withdraw battle deposit and reward
        battle.withdraw_balance_and_reward(world, army_left, army_protectee);

        // reduce battle army values
        let troop_config = TroopConfigCustomImpl::get(world);
        battle.reduce_battle_army_troops_and_health_by(army_left, troop_config);
        battle.reduce_battle_army_lifetime_by(original_army);

        if (battle.is_empty()) {
            // delete battle when the last participant leaves
            delete!(world, (battle));
        } else {
            // update battle if it still has participants
            battle.reset_delta(troop_config);
            set!(world, (battle));
        }

        // update army
        original_army = army_left;
        original_army.battle_id = 0;
        original_army.battle_side = BattleSide::None;
        set!(world, (original_army));

        // update army health
        let army_health = Health {
            entity_id: army_id,
            current: original_army.troops.full_health(troop_config),
            lifetime: original_army.troops.full_health(troop_config)
        };
        set!(world, (army_health));
    }
}
