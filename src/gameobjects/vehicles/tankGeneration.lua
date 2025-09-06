-- set palette here
local palette = {
    ["metalDark"] = "#d95d45",
    ["_defaultMat"] = "#cd0befff",    

    ["dark"] = "#323232", -- tire, lower body
    ["metalGreen"] = "#ff8800ff", -- body paint, middle of wheel
    ["metal"] = "#2b2b2bff",
    ["metalLight"] = "#a7a7a7ff", --bumper, wheel
    ["glass"] = "#99d6ff", -- windshield, headlight
    ["lightRed"] = "#ff3333", --siren, tail light
}

for key, value in pairs(palette) do
    forge.materialColor(key, value)
end


-- generate blocks here
wheels = { "vehicles/wheel_tank"}

treads = { "vehicles/track_wideSide", "vehicles/track_wideCenter" }

body = {"vehicles/body_topBackCargo"}
bodyFront = {"vehicles/body_frontTank"}

detailTank = {"Vehicles/detail_tank"}
