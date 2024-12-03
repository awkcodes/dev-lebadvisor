local http = require("socket.http")
local ltn12 = require("ltn12")
local json = require("dkjson")

local base_url = "http://localhost:8000/api"

-- Helper function to send HTTP requests
local function send_request(method, endpoint, body, headers)
    local response_body = {}
    local request_body = body and json.encode(body) or nil

    local res, code, response_headers = http.request{
        url = base_url .. endpoint,
        method = method,
        headers = headers or {},
        source = request_body and ltn12.source.string(request_body) or nil,
        sink = ltn12.sink.table(response_body)
    }

    return table.concat(response_body), code, response_headers
end

local function get_activities()
    local response, code = send_request("GET", "/activities/")
    print("Activitieses: ")
    print(response)
end

local function get_periods()
    local response, code = send_request("GET", "/periods/1/2024-06-03/")
    print("Activities for day 06-03-2024 in test activity")
    print(response)
end
get_activities()
get_periods()
