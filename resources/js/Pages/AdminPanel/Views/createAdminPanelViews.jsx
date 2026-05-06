import createDashboard from './Dashboard';
import createBrandManager from './BrandManager';
import createCategoryManager from './CategoryManager';
import createProductForm from './ProductForm';
import createProductManager from './ProductManager';
import createTagGenerator from './TagGenerator';
import createUserManager from './UserManager';
import createScanHistory from './ScanHistory';
import createSettings from './Settings';

export default function createAdminPanelViews(context) {
    return {
        Dashboard: createDashboard(context),
        BrandManager: createBrandManager(context),
        CategoryManager: createCategoryManager(context),
        ProductForm: createProductForm(context),
        ProductManager: createProductManager(context),
        TagGenerator: createTagGenerator(context),
        UserManager: createUserManager(context),
        ScanHistory: createScanHistory(context),
        Settings: createSettings(context),
    };
}
