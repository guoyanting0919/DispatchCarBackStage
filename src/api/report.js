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
