import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BranchService } from '../../../../services/branch.service';

@Component({
    selector: 'app-branch-images',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './branch-images.component.html',
    styleUrls: ['./branch-images.component.css']
})
export class BranchImagesComponent implements OnInit {
    branchId: number = 0;
    selectedFiles: File[] = [];
    isUploading: boolean = false;
    uploadSuccess: boolean = false;
    uploadError: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private branchService: BranchService,
        private router: Router
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.branchId = +id;
        } else {
            this.router.navigate(['/gym-owner/manage-branches']);
        }
    }

    onFileSelected(event: any): void {
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFiles = Array.from(event.target.files);
            this.uploadError = null;
            this.uploadSuccess = false;
        }
    }

    uploadImages(): void {
        if (this.selectedFiles.length === 0) {
            this.uploadError = "Please select at least one image.";
            return;
        }

        this.isUploading = true;
        this.uploadError = null;

        this.branchService.addImagesToBranch(this.branchId, this.selectedFiles).subscribe({
            next: (res) => {
                console.log('Upload response:', res);
                this.isUploading = false;
                this.uploadSuccess = true;
                this.selectedFiles = []; // Clear selection
                setTimeout(() => {
                    this.router.navigate(['/gym-owner/manage-branches']);
                }, 2000);
            },
            error: (err) => {
                console.error('Upload error:', err);
                this.isUploading = false;
                this.uploadError = err.message || 'Failed to upload images.';
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/gym-owner/manage-branches']);
    }
}
