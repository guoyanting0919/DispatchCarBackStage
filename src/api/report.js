import request from "@/utils/request";

/* 獲取接送數據(非車行) */
export function getPickUp(params) {
  return request({
    url: "/Reports/GetPickReportByCaseOrgA",
    method: "get",
    params,
  });
}

/* 獲取營收報表(非車行) */
export function getRevenue(params) {
  return request({
    url: "/Reports/GetRevenueReportByCaseOrgA",
    method: "get",
    params,
  });
}

/* 獲取車輛使用狀況(非車行) */
export function getCarUse(params) {
  return request({
    url: "/Reports/GetCarUseReportByCaseOrgA",
    method: "get",
    params,
  });
}

/* 獲取起迄區域比率(非車行) */
export function getStartEndRatio(params) {
  return request({
    url: "/Reports/GetSEareaReportByCaseOrgA",
    method: "get",
    params,
  });
}

/* 獲取服務區域趟次(非車行) */
export function getAreaService(params) {
  return request({
    url: "/Reports/GetUserAreaReportByCaseOrgA",
    method: "get",
    params,
  });
}
