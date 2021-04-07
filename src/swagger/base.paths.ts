import { PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import authPaths from './auth.paths'
import bannerPaths from './banner.paths'
import billPaths from './bill.path'
import categoryPaths from './category.paths'
import customerPaths from './customer.paths'
import domainPaths from './domain.paths'
import postPaths from './post.paths'
import pricingServicePaths from './pricingService.paths'
import servicePaths from './service.paths'
import settingPaths from './setting.paths'
import userPaths from './user.paths'

const paths: PathsObject = {
    ...authPaths,
    ...userPaths,
    ...categoryPaths,
    ...postPaths,
    ...bannerPaths,
    ...customerPaths,
    ...settingPaths,
    ...servicePaths,
    ...pricingServicePaths,
    ...billPaths,
    ...domainPaths
}

export default paths
