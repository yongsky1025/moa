import type {
  ReportFilterDTO,
  ReportRequestDTO,
  ReportStatusUpdateRequest,
  SanctionApplyRequest,
  SanctionCancelRequest,
  SanctionFilterDTO,
} from "../types/adminTypes";
import { API_SERVER_HOST_ADMIN } from "./adminDashboardApi";
import api from "../../api/axiosInstance";

// 신고
export const fetchReportList = async (dto: ReportFilterDTO) => {
  const res = await api.get(`${API_SERVER_HOST_ADMIN}/reports/list`, {
    params: {
      page: dto.page,
      size: dto.size,
      type: dto.type,
      keyword: dto.keyword,
      status: dto.status,
      targetType: dto.targetType,
      category: dto.category,
    },
  });
  console.log("report list data", res);

  return res.data;
};

export const fetchReportDetail = async (id: number) => {
  const res = await api.get(`${API_SERVER_HOST_ADMIN}/reports/${id}`);
  console.log("report detail", res);

  return res.data;
};

export const postReport = async (dto: ReportRequestDTO) => {
  const res = await api.post(`${API_SERVER_HOST_ADMIN}/reports`, dto);
  console.log("post report", dto);

  return res.data;
};

export const patchReportStatus = async (
  id: number,
  request: ReportStatusUpdateRequest,
) => {
  const res = await api.patch(
    `${API_SERVER_HOST_ADMIN}/reports/${id}/status`,
    null,
    {
      params: {
        status: request.status,
        adminNote: request.adminNote,
      },
    },
  );
  console.log("patch report status", id, request);

  return res.data;
};

// 제재
export const fetchSanctionList = async (dto: SanctionFilterDTO) => {
  const res = await api.get(`${API_SERVER_HOST_ADMIN}/sanctions/list`, {
    params: {
      page: dto.page,
      size: dto.size,
      type: dto.type,
      keyword: dto.keyword,
      targetType: dto.targetType,
      sanctionType: dto.sanctionType,
      sanctionState: dto.sanctionState,
    },
  });
  console.log("fetch sanction list", res);

  return res.data;
};

export const fetchSanctionDetail = async (id: number) => {
  const res = await api.get(`${API_SERVER_HOST_ADMIN}/sanctions/${id}`);
  console.log("sanction detail", res);

  return res.data;
};

export const fetchUserSanctionHistory = async (id: number) => {
  const res = await api.get(`${API_SERVER_HOST_ADMIN}/sanctions/users/${id}`);
  console.log("user sanction history", res);

  return res.data;
};

export const applySanction = async (dto: SanctionApplyRequest) => {
  const res = await api.post(`${API_SERVER_HOST_ADMIN}/sanctions`, dto);
  console.log("apply sanction", res);

  return res.data;
};

export const liftSanction = async (id: number) => {
  const res = await api.delete(`${API_SERVER_HOST_ADMIN}/sanctions/${id}`);
  console.log("lift sanction", res);

  return res.data;
};

export const cancelSanction = async (
  sanctionId: number,
  cancelReason: string,
) => {
  const res = await api.post(
    `${API_SERVER_HOST_ADMIN}/sanctions/${sanctionId}/cancel`,
    null,
    {
      params: { cancelReason },
    },
  );
  console.log("cancel sanction", res);

  return res.data;
};
