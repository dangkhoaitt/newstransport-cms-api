import { DynamicModule, Module, Provider } from '@nestjs/common'
import { Collection, Db, MongoClient, MongoClientOptions } from 'mongodb'
import { CollectionList } from 'src/share/constants/collection.constant'
import { MONGODB_PROVIDER } from 'src/share/constants/mongodb.constant'

@Module({})
export class MongodbModule {
    static forRoot(connectionString: string, options?: MongoClientOptions): DynamicModule {
        const mongodbProvider: Provider = {
            provide: MONGODB_PROVIDER,
            useFactory: async function(): Promise<Db> {
                const client = await MongoClient.connect(connectionString, options)

                return client.db()
            }
        }
        return {
            global: true,
            module: MongodbModule,
            providers: [mongodbProvider],
            exports: [mongodbProvider]
        }
    }

    static useCollection(collectionName: CollectionList): DynamicModule {
        const useCollectionProvider: Provider = {
            provide: collectionName,
            useFactory: function(db: Db): Collection {
                return db.collection(collectionName)
            },
            inject: [MONGODB_PROVIDER]
        }

        return {
            module: MongodbModule,
            providers: [useCollectionProvider],
            exports: [useCollectionProvider]
        }
    }
}
