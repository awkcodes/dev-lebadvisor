local http = require("socket.http")
local ltn12 = require("ltn12")
local json = require("dkjson")

local base_url = "http://localhost:8000/users"

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

-- Test user registration
local function test_register()
    local body = {
        username = "testuser",
        password = "testpassword",
        email = "test@example.com",
        is_supplier = false,
        is_customer = true
    }
    local response, code = send_request("POST", "/register/", body, {
        ["Content-Type"] = "application/json",
        ["Content-Length"] = #json.encode(body)
    })
    print("Register Response:", response)
    return json.decode(response)
end

-- Test user login
local function test_login()
    local body = {
        username = "testuser",
        password = "testpassword"
    }
    local response, code = send_request("POST", "/login/", body, {
        ["Content-Type"] = "application/json",
        ["Content-Length"] = #json.encode(body)
    })
    print("Login Response:", response)
    return json.decode(response)
end

-- Test get user info
local function test_get_user_info(token)
    local headers = {
        ["Authorization"] = "Token " .. token,
        ["Content-Type"] = "application/json"
    }
    for k, v in pairs(headers) do
        print("Header: " .. k .. " = " .. v)
    end
    local response, code = send_request("GET", "/user/", nil, headers)
    print("User Info Response:", response)
end

-- Test user logout
local function test_logout(token)
    local headers = {
        ["Authorization"] = "Token " .. token,
        ["Content-Type"] = "application/json"
    }
    for k, v in pairs(headers) do
        print("Header: " .. k .. " = " .. v)
    end
    local response, code = send_request("POST", "/logout/", nil, headers)
    print("Logout Response:", response)
end

-- Execute tests
local register_response = test_register()
local login_response = test_login()
local token = login_response.token
print("Login Token:", token)
test_get_user_info(token)
test_logout(token)