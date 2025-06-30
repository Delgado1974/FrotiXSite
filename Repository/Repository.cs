using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using FrotiX.Repository.IRepository;
using Microsoft.EntityFrameworkCore;

namespace FrotiX.Repository
{
    public class Repository<T> : IRepository<T>
        where T : class
    {
        protected readonly DbContext Context;
        internal DbSet<T> dbSet;

        public Repository(DbContext context)
        {
            Context = context;
            this.dbSet = context.Set<T>();
        }

        public void Add(T entity)
        {
            dbSet.Add(entity);
        }

        public T Get(Guid id)
        {
            return dbSet.Find(id);
        }

        public T GetFirstOrDefault(
            Expression<Func<T, bool>> filter = null,
            string includeProperties = null
        )
        {
            IQueryable<T> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

            //include properties serão separadas por vírgula
            if (includeProperties != null)
            {
                foreach (
                    var includeProperty in includeProperties.Split(
                        new char[] { ',' },
                        StringSplitOptions.RemoveEmptyEntries
                    )
                )
                {
                    query = query.Include(includeProperty);
                }
            }

            return query.FirstOrDefault();
        }

        private IQueryable<T> GetPreparedQuery(
            Expression<Func<T, bool>> filter,
            Func<IQueryable<T>, IOrderedQueryable<T>> orderBy,
            string includeProperties
        )
        {
            IQueryable<T> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

            //include properties serão separadas por vírgula
            if (includeProperties != null)
            {
                foreach (
                    var includeProperty in includeProperties.Split(
                        new char[] { ',' },
                        StringSplitOptions.RemoveEmptyEntries
                    )
                )
                {
                    query = query.Include(includeProperty);
                }
            }

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            return query;
        }

        public IEnumerable<T> GetAll(
            Expression<Func<T, bool>> filter = null,
            Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
            string includeProperties = null
        )
        {
            var query = GetPreparedQuery(filter, orderBy, includeProperties);

            return query.ToList();
        }

        public IEnumerable<TResult> GetAllReduced<TResult>(
            Expression<Func<T, TResult>> selector,
            Expression<Func<T, bool>> filter = null,
            Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
            string includeProperties = null
        )
        {
            var query = GetPreparedQuery(filter, orderBy, includeProperties);

            var reducedQuery = query.Select(selector);

            return reducedQuery.ToList();
        }

        public IQueryable<TResult> GetAllReducedIQueryable<TResult>(
            Expression<Func<T, TResult>> selector,
            Expression<Func<T, bool>> filter = null,
            Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
            string includeProperties = null
        )
        {
            var query = GetPreparedQuery(filter, orderBy, includeProperties);
            var reducedQuery = query.Select(selector);
            return reducedQuery; // <-- sem ToList()
        }

        public void Remove(Guid id)
        {
            T entityToRemove = dbSet.Find(id);
            Remove(entityToRemove);
        }

        public void Remove(T entity)
        {
            dbSet.Remove(entity);
        }
    }
}
