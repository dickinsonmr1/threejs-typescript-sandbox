forge.clear()

carHeight = math.random(10, 20) / 100
carWidth = math.random(100, 125) / 100
wheelArchHeight = math.random(0, 10) / 100
wheelHeight = 0.3
windshieldHeight = math.random(50, 100) / 100

-- asset, position, rotation, scale
forge.build("Vehicles/body_standard", {0, -carHeight, 0}, {0, 0, 0}, {carWidth, 1, 1})

randomFronts = { "Vehicles/body_frontStandard", "Vehicles/body_frontSports", "Vehicles/body_frontLuxury" }
randomFront  = randomFronts[math.random(#randomFronts)];

forge.build(randomFront, {0, -carHeight, 1}, {0, 0, 0}, {carWidth, 1, 1})

randomBacks = { "Vehicles/body_backStandard", "Vehicles/body_backFins", "Vehicles/body_backBed", "Vehicles/body_backBedClosed" }
randomBack  = randomBacks[math.random(#randomBacks)];

forge.build(randomBack, {0, -carHeight, -1}, {0, 0, 0}, {carWidth, 1, 1})

randomWindshields = { "Vehicles/body_topStandard", "Vehicles/body_topSteep", "Vehicles/body_topVan"}
randomWindshield  = randomWindshields[math.random(#randomWindshields)];

forge.build(randomWindshield, {0, 1 - carHeight, 0}, {0, 0, 0}, {1, windshieldHeight, 1})

randomTopBacks = {
    "Vehicles/body_topBackCargo",
    "Vehicles/body_topBackCargoWindows",
    "Vehicles/body_topBackMedium",
    "Vehicles/body_topBackSport",
    "Vehicles/body_topBackStandard",
    "Vehicles/body_topBackStation",
    "Vehicles/body_topBackVan",
    "Vehicles/body_topBackVanWindow",
}
randomTopBack  = randomTopBacks[math.random(#randomTopBacks)];
-- forge.build("Vehicles/body_topBackStandard", {0, 1 - carHeight, -1}, {0, 0, 0}, {1, windshieldHeight, 1})
forge.build(randomTopBack, {0, 1 - carHeight, -1}, {0, 0, 0}, {1, windshieldHeight, 1})

forge.build("Vehicles/detail_siren", {0, 1 + carHeight, -0.25}, {0, 0, 0}, {1, 1, 1})

randomWheels = { "Vehicles/wheel_standard", "Vehicles/wheel_classic", "Vehicles/wheel_ridges" }
randomWheel  = randomWheels[math.random(#randomWheels)];

forge.build(randomWheel, {-carWidth/2, wheelHeight, -0.75}, {0, 180, 0})
forge.build(randomWheel, {-carWidth/2, wheelHeight,  1}, {0, 180, 0})

forge.build(randomWheel, {carWidth/2, wheelHeight, -0.75}, {0, 0, 0})
forge.build(randomWheel, {carWidth/2, wheelHeight,  1}, {0, 0, 0})

forge.build("Vehicles/wheel_coverStandard", {-1, wheelHeight + wheelArchHeight, -0.75}, {0, 180, 0})
forge.build("Vehicles/wheel_coverStandard", {-1, wheelHeight + wheelArchHeight,  1}, {0, 180, 0})

forge.build("Vehicles/wheel_coverStandard", {1, wheelHeight + wheelArchHeight, -0.75}, {0, 0, 0})
forge.build("Vehicles/wheel_coverStandard", {1, wheelHeight + wheelArchHeight,  1}, {0, 0, 0})

randomBumpers = { "Vehicles/bumper", "Vehicles/bumper_detailed", "Vehicles/bumper_large" }
randomBumper  = randomBumpers[math.random(#randomBumpers)];

forge.build(randomBumper, {0, wheelHeight,  1}, {0, 0, 0})
forge.build(randomBumper, {0, wheelHeight,  -1}, {0, 180, 0})

if math.random(0, 2) == 0 then

	forge.build("Vehicles/bumper", {0, wheelHeight,  0}, {0, 90, 0})
	forge.build("Vehicles/bumper", {0, wheelHeight,  0}, {0, -90, 0})

end
