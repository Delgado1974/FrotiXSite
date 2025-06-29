using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace FrotiX.Repository.IRepository
{
    public interface IRepository<T> where T : class
    {
        T Get(Guid id);

        IEnumerable<T> GetAll(
            Expression<Func<T, bool>> filter = null,
            Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
            string includeProperties = null
            );

        IEnumerable<TResult> GetAllReduced<TResult>(
            Expression<Func<T, TResult>> selector,
            Expression<Func<T, bool>> filter = null,
            Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
            string includeProperties = null
            );

        T GetFirstOrDefault(
            Expression<Func<T, bool>> filter = null,
             string includeProperties = null
           );

        void Add(T entity);

        void Remove(Guid id);

        void Remove(T entity);
    }
}
