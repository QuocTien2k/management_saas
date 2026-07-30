/**
 * Trích xuất thông báo lỗi từ API response hoặc đối tượng Error.
 * 
 * @param error Đối tượng lỗi catch được trong khối try/catch (thường từ Axios)
 * @param defaultMessage Thông báo lỗi dự phòng nếu không tìm thấy thông tin lỗi cụ thể từ API
 * @returns Thông báo lỗi dạng chuỗi (string)
 */
export function getErrorMessage(
  error: any,
  defaultMessage = 'Có lỗi xảy ra, vui lòng thử lại sau.'
): string {
  if (!error) return defaultMessage;
  if (typeof error === 'string') return error;
  
  // Trích xuất từ NestJS / API standard error format (error.response?.data?.error?.message hoặc error.response?.data?.message)
  return (
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.message ||
    defaultMessage
  );
}
