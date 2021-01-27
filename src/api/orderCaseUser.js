import request from "@/utils/request";

export function load(params) {
  return request({
    url: "/orderOfCaseUsers/load",
    method: "get",
    params,
  });
}

export function loadNoOrg(params) {
  return request({
    url: "/orderOfCaseUsers/loadNoOrg",
    method: "get",
    params,
  });
}

export function get(params) {
  return request({
    url: "/orderOfCaseUsers/get",
    method: "get",
    params,
  });
}

export function receive(data) {
  return request({
    url: "/orderOfCaseUsers/updateOrgId",
    method: "post",
    data,
  });
}

export function add(data) {
  return request({
    url: "/orderOfCaseUsers/add",
    method: "post",
    data,
  });
}

export function update(data) {
  return request({
    url: "/orderOfCaseUsers/update",
    method: "post",
    data,
  });
}

export function remove(data) {
  return request({
    url: "/orderOfCaseUsers/delete",
    method: "post",
    data,
  });
}

export function loadDespatch(params) {
  return request({
    url: "/orderOfCaseUsers/loadwithdespatch",
    method: "get",
    params,
  });
}

export function cancel(data) {
  return request({
    url: "/orderOfCaseUsers/CancelOrder",
    method: "post",
    data,
  });
}

export function getDiscount(params) {
  return request({
    url: "/orderOfCaseUsers/GetCaseOrderAmt",
    method: "get",
    params,
  });
}
