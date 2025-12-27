import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { of } from 'rxjs';
export interface StaffMember {
  id: number;
  userId: number;
  branchId: number;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  status: string;
}

export interface StaffListResponse {
  data: StaffMember[];
  isSuccess: boolean;
  message: string;
  errorCode: string;
}

export interface SingleStaffResponse {
  data: StaffMember;
  isSuccess: boolean;
  message: string;
  errorCode: string;
}

export interface DeleteStaffResponse {
  data: boolean;
  isSuccess: boolean;
  message: string;
  errorCode: string;
}

export interface AssignStaffResponse {
  data: boolean;
  isSuccess: boolean;
  message: string;
  errorCode: string;
}
export interface CreateStaffRequest {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  password: string;
  confirmPassword: string;
  status: string;
}

export interface CreateStaffResponse {
  data: any;
  isSuccess: boolean;
  message: string;
  errorCode: string;
}
export interface UpdateStaffRequest {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

export interface UpdateStaffResponse {
  data: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    status: string;
  };
  isSuccess: boolean;
  message: string;
  errorCode: string;
}
@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private apiUrl = 'http://localhost:5024/api/owner/Staff';

  constructor(private http: HttpClient) {}
getStaffMembers(branchId: number): Observable<StaffMember[]> {
  const url = `${this.apiUrl}/GetStaffMembers/${branchId}`;
  console.log('🔵 Fetching staff from URL:', url);
  
  return this.http.get<StaffListResponse>(url)
    .pipe(
      map(response => {
        console.log('🟢 Staff API Response:', response);
        
        // ✅ لو مفيش staff، ارجع array فاضي بدل error
        if (response.isSuccess && response.data) {
          console.log('🟢 Success! Staff data:', response.data);
          return response.data;
        }
        
        // ✅ لو الرسالة "no Staff member", ارجع array فاضي
        if (response.message && response.message.toLowerCase().includes('no staff')) {
          console.log('🟡 No staff members found, returning empty array');
          return [];
        }
        
        // لو في error حقيقي
        throw new Error(response.message || 'Failed to load staff members');
      }),
      catchError(error => {
        console.error('🔴 Staff API Error:', error);
        
        // ✅ لو الـ error status 204 (No Content)، ارجع array فاضي
        if (error.status === 204 || error.errorCode === 'NoContent') {
          console.log('🟡 No content, returning empty array');
          return throwError(() => []); // أو يمكنك استخدام: of([])
        }
        
        return throwError(() => new Error(error.message || 'Error loading staff members'));
      })
    );
}

  getStaffMember(staffId: number): Observable<StaffMember> {
    return this.http.get<SingleStaffResponse>(`${this.apiUrl}/GetStaffMember/${staffId}`)
      .pipe(
        map(response => {
          if (response.isSuccess) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to load staff member');
        }),
        catchError(error => {
          console.error('Get Staff Member Error:', error);
          return throwError(() => new Error(error.message || 'Error loading staff member'));
        })
      );
  }
deleteStaffMember(staffId: number): Observable<boolean> {
  const url = `${this.apiUrl}/DeleteStaffMember/${staffId}`;
  console.log('🔵 DELETE Request URL:', url);
  
  return this.http.delete<DeleteStaffResponse>(url)
    .pipe(
      map(response => {
        console.log('✅ Delete Response:', response);
        console.log('✅ isSuccess:', response.isSuccess);
        console.log('✅ data:', response.data);
        console.log('✅ message:', response.message);
        
        // ✅ اعتمد على isSuccess بدل data
        if (response.isSuccess) {
          console.log('✅ Staff member deleted successfully (based on isSuccess)');
          return true; // ✅ ارجع true بدل response.data
        }
        
        throw new Error(response.message || 'Failed to delete staff member');
      }),
      catchError(error => {
        console.error('🔴 Delete Error:', error);
        return throwError(() => new Error(error.message || 'Error deleting staff member'));
      })
    );
}
  assignStaffToBranch(staffId: number, branchId: number): Observable<boolean> {
    return this.http.get<AssignStaffResponse>(
      `${this.apiUrl}/AssignStaffToBranch/${staffId}/${branchId}`
    ).pipe(
      map(response => {
        if (response.isSuccess) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to assign staff to branch');
      }),
      catchError(error => {
        console.error('Assign Staff Error:', error);
        return throwError(() => new Error(error.message || 'Error assigning staff'));
      })
    );
  }

createStaff(staffData: CreateStaffRequest): Observable<any> {
  const formData = new FormData();
  formData.append('FullName', staffData.fullName);
  formData.append('Email', staffData.email);
  formData.append('Phone', staffData.phone);
  formData.append('City', staffData.city);
  formData.append('Password', staffData.password);
  formData.append('ConfirmPassword', staffData.confirmPassword);
  formData.append('Status', staffData.status);

  // ✅ أضف responseType: 'text' عشان نتعامل مع text response
  return this.http.post(
    'http://localhost:5024/api/Auth/register-staff',
    formData,
    { responseType: 'text' } // ✅ هنا التغيير
  ).pipe(
    map(response => {
      console.log('✅ Create staff SUCCESS - Raw response:', response);
      
      // حاول تحول الـ response لـ JSON لو ممكن
      try {
        const jsonResponse = JSON.parse(response);
        console.log('✅ Parsed JSON:', jsonResponse);
        return jsonResponse;
      } catch (e) {
        // لو مش JSON، ارجع الـ response زي ما هو
        console.log('✅ Response is not JSON, returning as text');
        return { success: true, message: response };
      }
    }),
    catchError(error => {
      console.error('🔴 Create Staff Error:', error);
      console.error('🔴 Error status:', error.status);
      console.error('🔴 Error text:', error.error);
      
      // لو status 200 أو 201، يبقى نجح
      if (error.status === 200 || error.status === 201) {
        console.log('✅ Status is 200/201, treating as success');
        return of({ success: true, data: error.error });
      }
      
      return throwError(() => new Error(error.error || 'Error creating staff member'));
    })
  );
}
getAllBranchStaff(): Observable<StaffMember[]> {
  const url = `${this.apiUrl}/GetAllBranchStaff`;
  console.log('🔵 Fetching all staff from URL:', url);
  
  return this.http.get<StaffListResponse>(url)
    .pipe(
      map(response => {
        console.log('🟢 All Staff API Response:', response);
        
        // ✅ لو مفيش بيانات، ارجع array فاضي
        if (!response.data || response.errorCode === 'NoContent') {
          console.log('🟡 No staff members, returning empty array');
          return [];
        }
        
        if (response.isSuccess) {
          return response.data;
        }
        
        throw new Error(response.message || 'Failed to load all staff');
      }),
      catchError(error => {
        console.error('🔴 All Staff API Error:', error);
        
        // ✅ لو الـ error هو "no staff"، ارجع array فاضي بدل error
        if (error.message && error.message.toLowerCase().includes('no staff')) {
          console.log('🟡 Handling "no staff" as empty array');
          return of([]);
        }
        
        return throwError(() => error);
      })
    );
}
updateStaffMember(staffId: number, staffData: UpdateStaffRequest): Observable<any> {
  return this.http.put<UpdateStaffResponse>(
    `${this.apiUrl}/UpdateStaffMember/${staffId}`,
    staffData
  ).pipe(
    map(response => {
      console.log('Update staff response:', response);
      if (response.isSuccess) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update staff member');
    }),
    catchError(error => {
      console.error('Update Staff Error:', error);
      return throwError(() => new Error(error.message || 'Error updating staff member'));
    })
  );
}
}