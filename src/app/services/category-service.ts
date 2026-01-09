import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  status: 'active' | 'inactive' | 'draft';
  displayOrder: number;
  isFeatured: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly STORAGE_KEY = 'categories';
  
  constructor() {
    // Initialize with sample data if empty
    this.initializeSampleData();
  }
  
  private initializeSampleData(): void {
    const existingCategories = this.getCategoriesFromStorage();
    if (existingCategories.length === 0) {
      const sampleCategories: ICategory[] = [
        {
          id: this.generateId(),
          name: 'Electronics',
          slug: 'electronics',
          description: 'All electronic gadgets and devices',
          parentId: '',
          status: 'active',
          displayOrder: 1,
          isFeatured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: this.generateId(),
          name: 'Clothing',
          slug: 'clothing',
          description: 'Fashion and apparel',
          parentId: '',
          status: 'active',
          displayOrder: 2,
          isFeatured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: this.generateId(),
          name: 'Mobile Phones',
          slug: 'mobile-phones',
          description: 'Smartphones and feature phones',
          parentId: 'electronics',
          status: 'active',
          displayOrder: 1,
          isFeatured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      this.saveCategoriesToStorage(sampleCategories);
    }
  }
  
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  private getCategoriesFromStorage(): ICategory[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
  
  private saveCategoriesToStorage(categories: ICategory[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
  }
  
  // Create a new category
  createCategory(categoryData: Omit<ICategory, 'id' | 'createdAt' | 'updatedAt'>): Observable<ICategory> {
    const categories = this.getCategoriesFromStorage();
    
    const newCategory: ICategory = {
      ...categoryData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    categories.push(newCategory);
    this.saveCategoriesToStorage(categories);
    
    return of(newCategory);
  }
  
  // Get all categories
  getCategories(): Observable<ICategory[]> {
    const categories = this.getCategoriesFromStorage();
    return of(categories);
  }
  
  // Get category by ID
  getCategoryById(id: string): Observable<ICategory | null> {
    const categories = this.getCategoriesFromStorage();
    const category = categories.find(cat => cat.id === id);
    return of(category || null);
  }
  
  // Get categories by parent ID
  getSubcategories(parentId: string): Observable<ICategory[]> {
    const categories = this.getCategoriesFromStorage();
    const subcategories = categories.filter(cat => cat.parentId === parentId);
    return of(subcategories);
  }
  
  // Get top-level categories (no parent)
  getTopLevelCategories(): Observable<ICategory[]> {
    const categories = this.getCategoriesFromStorage();
    const topLevel = categories.filter(cat => !cat.parentId || cat.parentId === '');
    return of(topLevel);
  }
  
  // Get featured categories
  getFeaturedCategories(): Observable<ICategory[]> {
    const categories = this.getCategoriesFromStorage();
    const featured = categories.filter(cat => cat.isFeatured && cat.status === 'active');
    return of(featured);
  }
  
  // Update category
  updateCategory(id: string, updates: Partial<ICategory>): Observable<ICategory | null> {
    const categories = this.getCategoriesFromStorage();
    const index = categories.findIndex(cat => cat.id === id);
    
    if (index === -1) {
      return of(null);
    }
    
    categories[index] = {
      ...categories[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveCategoriesToStorage(categories);
    return of(categories[index]);
  }
  
  // Delete category
  deleteCategory(id: string): Observable<boolean> {
    const categories = this.getCategoriesFromStorage();
    const initialLength = categories.length;
    
    const updatedCategories = categories.filter(cat => cat.id !== id);
    
    // Also delete any subcategories (optional - depends on your requirements)
    // const categoriesWithNoParent = updatedCategories.filter(cat => cat.parentId !== id);
    
    this.saveCategoriesToStorage(updatedCategories);
    
    const isDeleted = updatedCategories.length < initialLength;
    return of(isDeleted);
  }
  
  // Search categories by name
  searchCategories(searchTerm: string): Observable<ICategory[]> {
    const categories = this.getCategoriesFromStorage();
    const filtered = categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return of(filtered);
  }
  
  // Check if slug exists
  isSlugExists(slug: string, excludeId?: string | undefined | null): Observable<boolean> {
    const categories = this.getCategoriesFromStorage();
    const exists = categories.some(cat => 
      cat.slug === slug && (!excludeId || cat.id !== excludeId)
    );
    return of(exists);
  }
  
  // Get active categories only
  getActiveCategories(): Observable<ICategory[]> {
    const categories = this.getCategoriesFromStorage();
    const active = categories.filter(cat => cat.status === 'active');
    return of(active);
  }
  
  // Clear all categories (for testing/reset)
  clearAllCategories(): Observable<void> {
    localStorage.removeItem(this.STORAGE_KEY);
    return of(void 0);
  }
}